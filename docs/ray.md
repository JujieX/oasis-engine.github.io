---
order: 13 title: RayCast type: Component
---

A ray can be understood as an endless line emitted from a point in one direction in the 3D world. Ray casting is very
widely used in 3D applications. With such method, you can pick up objects in the 3D scene when the user taps on the
screen; you can also judge whether the bullet can hit the target in a shooting game.

![image.png](https://gw.alipayobjects.com/mdn/rms_d27172/afts/img/A*sr_IRYSLugMAAAAAAAAAAAAAARQnAQ) （_Picture from Web_）

The ray detection in Oasis uses different algorithms according to different physical backends. The currently supported
physical backends are:

1. physics-lite
2. physics-physx

The former is the ray detection used in past milestones, which directly traverses all colliders in the scene to
intersect. The latter is based on the collision detection algorithm provided by PhysX, which has better performance when
there are more collision boxes.

In order to apply different physics backends, you need to specify a specific backend when initializing the engine. For
example, as shown in the following example, LitePhysics needs to be passed in, and the corresponding physx backend needs
to be passed in PhysXPhysics.

## The Usage of RayCast

When using ray casting, first introduce the [Ray](${api}math/Ray) module in the code; then generate the ray. The ray can
be customized or generated by the camera ([camera](${api}core/ Camera#viewportPointToRay)) Convert the screen input into
rays; finally call the [PhysicsManager.raycast](${api}core/PhysicsManager#raycast) method to detect the collider hit by
the raycast. code show as below:

```typescript
// Load Raycast module
import { WebGLEngine, HitResult, Ray } from "oasis-engine";
import { LitePhysics } from "@oasis-engine/physics-lite";

const engine = new WebGLEngine("canvas", LitePhysics);
engine.canvas.resizeByClientSize();

// Self-defined ray
let ray = new Ray([0, 0, 0], [0, 0, 1]);
let result = scene.raycast(ray);
if (result) {
  console.log("hit on the object");
}
// Convert screen input to Ray
document.getElementById("canvas").addEventListener("click", (e) => {
  const ratio = window.devicePixelRatio;
  camera.screenPointToRay(new Vector2(e.offsetX, e.offsetY).scale(ratio), ray);
  const hit = new HitResult();
  result = engine.physicsManager.raycast(ray, Number.MAX_VALUE, Layer.Everything, hit);
  if (result) {
    console.log(hit.entity.name);
  }
});
```

It needs to be pointed out that if you want to enable ray casting on an Entity, the Entity must have a Collider,
otherwise it cannot be triggered.