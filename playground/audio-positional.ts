/**
 * @title Audio Positional
 * @category Audio
 */
import {
  AssetType,
  AudioClip,
  AudioListener,
  PositionalAudioSource,
  AudioSource,
  BoxColliderShape,
  Camera,
  Entity,
  MeshRenderer,
  Pointer,
  PrimitiveMesh,
  Script,
  StaticCollider,
  TextRenderer,
  UnlitMaterial,
  Vector3,
  WebGLEngine,
} from "@galacean/engine";
import { LitePhysics } from "@galacean/engine-physics-lite";

class RecorderScript extends Script {
  public onClick: () => any;
  onPointerDown(pointer: Pointer): void {
    this.onClick && this.onClick();
  }
}

class LightScript extends Script {
  public isPlaying: boolean = false;
  private _startX: number = -4;
  private _x: number = -4;
  // from left to right
  private _originDir: boolean = true;
  private _currDir: boolean = true;

  set startX(value: number) {
    this._startX = value;
    this._x = value;

    if (value <= 0) {
      this._originDir = true;
    } else {
      this._originDir = false;
    }
  }

  get startX(): number {
    return this._startX;
  }

  constructor(entity: Entity) {
    super(entity);
  }

  onUpdate(deltaTime: number): void {
    if (!this.isPlaying) return;
    if (this._originDir) {
      // 开始时候是从左向右
      if (this._x >= -this.startX) {
        this._currDir = false;
      }
      if (this._x <= this.startX) {
        this._currDir = true;
      }
    } else {
      // 开始的时候是从右向左
      if (this._x >= this.startX) {
        this._currDir = false;
      }
      if (this._x <= -this.startX) {
        this._currDir = true;
      }
    }

    // 根据current direction计算
    if (this._currDir) {
      this._x = this._x + 4 * deltaTime;
    } else {
      this._x = this._x - 4 * deltaTime;
    }

    this.entity.transform.setPosition(this._x, 0, 0);
  }
}

class BarScript extends Script {
  private _audioSource: PositionalAudioSource;
  private _barRenderer: TextRenderer;

  constructor(entity: Entity) {
    super(entity);
    this._audioSource = entity.getComponent(PositionalAudioSource);
    this._barRenderer = entity.children[0].getComponent(TextRenderer);
  }

  onUpdate(deltaTime: number): void {
    if (this._audioSource.isPlaying) {
      const percent =
        this._audioSource.position / this._audioSource.clip.duration;
      this._barRenderer.text = `${Math.floor(percent * 100)}` + "%";
    }
  }
}

function addBtn(
  rootEntity: Entity,
  position: Vector3,
  name: string,
  clickHandler: () => any
) {
  const playEntity = rootEntity.createChild(name);
  playEntity.transform.setPosition(position.x, position.y, position.z);

  const playCollider = playEntity.addComponent(StaticCollider);
  const playShape = new BoxColliderShape();
  playShape.size = new Vector3(1.4, 0.9, 1);
  playCollider.addShape(playShape);

  const playBtnEntity = playEntity.createChild("playbtn");
  playBtnEntity.transform.setPosition(0, 1, 0);
  const playText = playBtnEntity.addComponent(TextRenderer);
  playText.text = name;

  const cube = playEntity.addComponent(MeshRenderer);
  cube.mesh = PrimitiveMesh.createTorus(rootEntity.engine);
  const material = new UnlitMaterial(rootEntity.engine);
  material.baseColor.set(position.x, position.y, position.z, 1);
  cube.setMaterial(material);

  const playScript = playEntity.addComponent(RecorderScript);
  playScript.onClick = clickHandler;

  return playEntity;
}

// Create engine
WebGLEngine.create({ canvas: "canvas", physics: new LitePhysics() }).then(
  (engine) => {
    engine.canvas.resizeByClientSize();
    // Create root entity
    const rootEntity = engine.sceneManager.activeScene.createRootEntity();

    // Create camera
    const cameraEntity = rootEntity.createChild("Camera");
    cameraEntity.transform.setPosition(0, 0, 16);
    cameraEntity.transform.lookAt(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
    cameraEntity.addComponent(Camera);

    engine.resourceManager
      .load<AudioBuffer>({
        url: "https://mass-office.alipay.com/huamei_koqzbu/afts/file/JLvfSZkPfIoAAAAAAAAAABAADnV5AQBr",
        type: AssetType.Audio,
      })
      .then((res) => {
        const clip = new AudioClip("new");
        clip.setData(res);
        const listenEntity = rootEntity.createChild("listen");
        const listener = listenEntity.addComponent(AudioListener);

        const playerEntity = rootEntity.createChild("player");

        const audioSource = playerEntity.addComponent(PositionalAudioSource);
        playerEntity.transform.worldForward.set(0, 0, 1);

        const sphere = playerEntity.addComponent(MeshRenderer);
        sphere.mesh = PrimitiveMesh.createSphere(engine);
        const material = new UnlitMaterial(engine);
        sphere.setMaterial(material);

        const lightHandler = playerEntity.addComponent(LightScript);
        lightHandler.startX = -4;

        audioSource.clip = clip;

        audioSource.onPlayEnd = () => {
          lightHandler.isPlaying = false;
        };

        const percentEntity = playerEntity.createChild();
        percentEntity.transform.setPosition(0, 4, 0);
        const test = percentEntity.addComponent(TextRenderer);
        test.fontSize = 80;

        playerEntity.addComponent(BarScript);

        // play btn
        addBtn(rootEntity, new Vector3(3.3, 4, 0), "PLAY", () => {
          audioSource.play();
          lightHandler.isPlaying = true;
        });

        // stop btn
        addBtn(rootEntity, new Vector3(1.5, 4, 0), "STOP", () => {
          audioSource.stop();
        });
      });

    engine.run();
  }
);
