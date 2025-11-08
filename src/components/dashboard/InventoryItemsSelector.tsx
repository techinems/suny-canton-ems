import { MultiSelect, Card, Text, Stack, Group, Button, NumberInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useEffect, useState, useMemo } from 'react';
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
  
  // Memoize the current quantity map with defaults for new items
  const currentQuantityMap = useMemo(() => {
    const result = { ...quantityMap };
    let hasNewItems = false;
    
    selectedItemIds.forEach(itemId => {
      if (result[itemId] === undefined && inventoryItemsMap[itemId]) {
        result[itemId] = 1; // Default quantity
        hasNewItems = true;
      }
    });
    
    // If we found new items, update the state in the next render
    if (hasNewItems) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setQuantityMap(result);
      }, 0);
    }
    
    return result;
  }, [selectedItemIds, inventoryItemsMap, quantityMap]);
  
  // Convert selected items and quantities to the structured format when either changes
  useEffect(() => {
    if (!selectedItemIds || !inventoryItemsMap) return;
    
    // Only include items that are currently selected
    const itemsWithQuantities = selectedItemIds
      .filter(id => inventoryItemsMap[id] && currentQuantityMap[id] !== undefined)
      .map(itemId => {
        const item = inventoryItemsMap[itemId];
        return {
          itemId,
          quantity: currentQuantityMap[itemId] || 1,
          itemName: item.itemName || 'Unknown Item',
          maxQuantity: item.quantity
        };
      });
    
    // Notify parent component of the items with quantities
    onItemsWithQuantitiesChange(itemsWithQuantities);
  }, [selectedItemIds, currentQuantityMap, inventoryItemsMap, onItemsWithQuantitiesChange]);
  
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
        quantity: currentQuantityMap[itemId] || 1,
        itemName: item.itemName || 'Unknown Item',
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