import CADObject from "./CADObject";

export default function Scene({
  objects,
  selectedObjectIds,
  onSelectObject,
  transformMode,
  onTransformObject,
  axisLock,
}) {
  return (
    <group>
      {objects.map((obj) => (
        <CADObject
          key={obj.id}
          object={obj}
          isSelected={selectedObjectIds.includes(obj.id)}
          onSelect={(e) => {
            const isMultiSelect = e.ctrlKey || e.metaKey;
            onSelectObject(obj.id, isMultiSelect);
          }}
          transformMode={transformMode}
          onTransform={(transform, options) =>
            onTransformObject(obj.id, transform, options)
          }
          axisLock={axisLock}
        />
      ))}
    </group>
  );
}
