'use client';
import { 
  Title, 
  Container, 
  Stack, 
  Breadcrumbs,
  Anchor,
  Text,
  Loader,
  Center
} from '@mantine/core';
import { InventoryForm } from '@/components/dashboard/InventoryForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getInventoryItem } from '@/lib/client/inventoryService';
import { useParams } from 'next/navigation';

export default function EditInventoryItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [itemName, setItemName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchItemName = async () => {
      const item = await getInventoryItem(id);
      if (item) {
        setItemName(item.item_name);
      }
      setLoading(false);
    };
    
    fetchItemName();
  }, [id]);

  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/dashboard/inventory' },
    { title: loading ? 'Loading...' : `Edit ${itemName}`, href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        
        {loading ? (
          <Center h={100}>
            <Loader />
          </Center>
        ) : (
          <>
            <Title order={2}>Edit Inventory Item: {itemName}</Title>
            <Text c="dimmed" mb="lg">
              Update inventory item information and save changes
            </Text>
            <InventoryForm inventoryId={id} isEditing={true} />
          </>
        )}
      </Stack>
    </Container>
  );
}