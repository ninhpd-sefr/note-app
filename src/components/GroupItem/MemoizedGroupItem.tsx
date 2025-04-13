// components/MemoizedGroupItem.tsx
import React, { memo } from "react";
import GroupItem from "./GroupItem";

const areEqual = (
  prevProps: { item: { id: string; name: string } },
  nextProps: { item: { id: string; name: string } }
) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
  );
};

const MemoizedGroupItem = memo(GroupItem, areEqual);

export default MemoizedGroupItem;
