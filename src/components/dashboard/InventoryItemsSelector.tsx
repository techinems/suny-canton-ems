import { MultiSelect, Card, Text, Stack, Group, Button, NumberInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import { InventoryItem } from '@/lib/client/inventoryService';

// Define an interface for items with quantities
export interface ItemWithQuantity {
  itemId: string;
  quantity: number;
  itemName: string;
  maxQuantity: number;
}

interface InventoryItemOption {
  value: string;
  label: string;
}

interface InventoryItemsSelectorProps {
  inventoryItems: InventoryItemOption[];
  inventoryItemsMap: Record<string, InventoryItem>;
  selectedItemIds: string[];
  onItemsChange: (itemIds: string[]) => void;
  onItemsWithQuantitiesChange: (items: ItemWithQuantity[]) => void;
}

export function InventoryItemsSelector({
  inventoryItems,
  inventoryItemsMap,
  selectedItemIds,
  onItemsChange,
  onItemsWithQuantitiesChange
}: InventoryItemsSelectorProps) {
  // Store quantities separate from the selected items
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  // Prevent infinite loops with useRef for tracking previous values
  const prevSelectedItemsRef = useRef<string[]>([]);
  const prevQuantityMapRef = useRef<Record<string, number>>({});
  
  // Initialize quantities for newly selected items
  useEffect(() => {
    if (!selectedItemIds || !inventoryItemsMap) return;
    
    // Skip if the selected items haven't changed
    if (
      prevSelectedItemsRef.current.length === selectedItemIds.length &&
      prevSelectedItemsRef.current.every(id => selectedItemIds.includes(id))
    ) {
      return;
    }
    
    // Update the ref
    prevSelectedItemsRef.current = [...selectedItemIds];
    
    // Create a batch update for any new items
    const updates: Record<string, number> = {};
    let hasUpdates = false;
    
    // Check for items that need default quantities
    selectedItemIds.forEach(itemId => {
      if (quantityMap[itemId] === undefined && inventoryItemsMap[itemId]) {
        updates[itemId] = 1; // Default quantity
        hasUpdates = true;
      }
    });
    
    // Only update state if we have new items
    if (hasUpdates) {
      setQuantityMap(prev => ({...prev, ...updates}));
    }
  }, [selectedItemIds, inventoryItemsMap, quantityMap]);
  
  // Convert selected items and quantities to the structured format when either changes
  useEffect(() => {
    if (!selectedItemIds || !inventoryItemsMap) return;
    
    // Check if the quantity map has actually changed
    const quantityMapChanged = 
      JSON.stringify(prevQuantityMapRef.current) !== JSON.stringify(quantityMap);
    
    // Only update if the selected items or quantities have changed
    if (
      !quantityMapChanged && 
      prevSelectedItemsRef.current.length === selectedItemIds.length &&
      prevSelectedItemsRef.current.every(id => selectedItemIds.includes(id))
    ) {
      return;
    }
    
    // Update refs
    prevQuantityMapRef.current = {...quantityMap};
    prevSelectedItemsRef.current = [...selectedItemIds];
    
    // Only include items that are currently selected
    const itemsWithQuantities = selectedItemIds
      .filter(id => inventoryItemsMap[id] && quantityMap[id] !== undefined)
      .map(itemId => {
        const item = inventoryItemsMap[itemId];
        return {
          itemId,
          quantity: quantityMap[itemId] || 1,
          itemName: item.item_name,
          maxQuantity: item.quantity
        };
      });
    
    // Notify parent component of the items with quantities
    onItemsWithQuantitiesChange(itemsWithQuantities);
  }, [selectedItemIds, quantityMap, inventoryItemsMap, onItemsWithQuantitiesChange]);
  
  // Handle quantity changes for a specific item
  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    const item = inventoryItemsMap[itemId];
    if (!item) return;
    
    // Apply min/max constraints
    const constrainedQuantity = Math.min(item.quantity, Math.max(1, quantity));
    
    // Update the quantity map
    setQuantityMap(prev => ({
      ...prev,
      [itemId]: constrainedQuantity
    }));
  };
  
  // Generate the items with quantities for display
  const itemsWithQuantitiesForDisplay = selectedItemIds
    .filter(id => inventoryItemsMap[id])
    .map(itemId => {
      const item = inventoryItemsMap[itemId];
      return {
        itemId,
        quantity: quantityMap[itemId] || 1,
        itemName: item.item_name,
        maxQuantity: item.quantity
      };
    });

  return (
    <>
      <MultiSelect
        label="Items Used"
        placeholder="Select items used during the call"
        data={inventoryItems}
        searchable
        clearable
        value={selectedItemIds}
        onChange={onItemsChange}
      />
      
      {itemsWithQuantitiesForDisplay.length > 0 && (
        <Card withBorder p="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Text fw={500}>Specify Quantities Used</Text>
          </Card.Section>
          
          <Stack gap="xs" mt="xs">
            {itemsWithQuantitiesForDisplay.map((item) => (
              <Group key={item.itemId} justify="space-between" wrap="nowrap">
                <Text size="sm" style={{ flex: 1 }}>{item.itemName}</Text>
                <Group gap={8} wrap="nowrap">
                  <Button 
                    variant="subtle" 
                    size="xs" 
                    disabled={item.quantity <= 1}
                    onClick={() => handleItemQuantityChange(item.itemId, item.quantity - 1)}
                  >
                    <IconMinus size="0.8rem" />
                  </Button>
                  
                  <NumberInput
                    value={item.quantity}
                    onChange={(value) => handleItemQuantityChange(item.itemId, Number(value || 1))}
                    min={1}
                    max={item.maxQuantity}
                    style={{ width: '70px' }}
                    size="xs"
                    hideControls
                  />
                  
                  <Button 
                    variant="subtle" 
                    size="xs" 
                    disabled={item.quantity >= item.maxQuantity}
                    onClick={() => handleItemQuantityChange(item.itemId, item.quantity + 1)}
                  >
                    <IconPlus size="0.8rem" />
                  </Button>
                  
                  <Text size="xs" c="dimmed">
                    / {item.maxQuantity} available
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>
          
          <Text size="xs" c="dimmed" mt="md">
            Adjust the quantities for each item used during this call. The maximum value reflects current inventory.
          </Text>
        </Card>
      )}
    </>
  );
}