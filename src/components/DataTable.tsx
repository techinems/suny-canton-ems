'use client';
import { useState } from 'react';
import { 
  Table, 
  Group, 
  Text, 
  ActionIcon, 
  Menu, 
  Loader,
  Center,
  Modal,
  Button
} from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';

// Define types for the component props
export interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface Action<T> {
  label: string;
  icon: React.ReactNode;
  onClick?: (item: T) => void;
  href?: (item: T) => string;
  color?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  idKey?: keyof T;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  confirmDelete?: {
    title: string;
    message: (item: T) => string;
    onConfirm: (item: T) => Promise<void>;
  };
}

export function DataTable<T>({ 
  data, 
  columns, 
  actions = [], 
  loading = false, 
  idKey = 'id' as keyof T, 
  onRowClick,
  emptyMessage = 'No data available',
  confirmDelete
}: DataTableProps<T>) {
  const [opened, { open, close }] = useDisclosure(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    open();
  };

  const confirmDeleteAction = async () => {
    if (itemToDelete && confirmDelete) {
      await confirmDelete.onConfirm(itemToDelete);
      close();
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  if (data.length === 0) {
    return (
      <Center h={100}>
        <Text c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  const hasDeleteAction = actions.some(action => action.color === 'red');

  return (
    <>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.key}>{column.title}</Table.Th>
            ))}
            {actions.length > 0 && <Table.Th>Actions</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => (
            <Table.Tr 
              key={String(item[idKey])} 
              style={onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => (
                <Table.Td key={`${String(item[idKey])}-${column.key}`}>
                  {column.render ? column.render(item) : String(item[column.key as keyof T] || '')}
                </Table.Td>
              ))}
              {actions.length > 0 && (
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDotsVertical size="1rem" />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {actions.map((action, index) => {
                        if (action.color === 'red' && confirmDelete) {
                          return (
                            <Menu.Item 
                              key={index}
                              leftSection={action.icon}
                              color={action.color}
                              onClick={() => handleDeleteClick(item)}
                            >
                              {action.label}
                            </Menu.Item>
                          );
                        }
                        
                        if (action.href) {
                          return (
                            <Menu.Item 
                              key={index}
                              leftSection={action.icon}
                              component={Link}
                              href={action.href(item)}
                              color={action.color}
                            >
                              {action.label}
                            </Menu.Item>
                          );
                        }
                        
                        return (
                          <Menu.Item 
                            key={index}
                            leftSection={action.icon}
                            onClick={action.onClick ? () => action.onClick!(item) : undefined}
                            color={action.color}
                          >
                            {action.label}
                          </Menu.Item>
                        );
                      })}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {hasDeleteAction && confirmDelete && (
        <Modal opened={opened} onClose={close} title={confirmDelete.title} centered>
          {itemToDelete && (
            <>
              <Text>{confirmDelete.message(itemToDelete)}</Text>
              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={close}>Cancel</Button>
                <Button color="red" onClick={confirmDeleteAction}>Delete</Button>
              </Group>
            </>
          )}
        </Modal>
      )}
    </>
  );
}