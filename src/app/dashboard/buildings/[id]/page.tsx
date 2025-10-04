'use client';

import {
  Title,
  Container,
  Stack,
  Breadcrumbs,
  Anchor,
  Loader,
  Center,
} from '@mantine/core';
import { BuildingForm } from '@/components/dashboard/BuildingForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBuilding } from '@/lib/client/buildingService';
import { useParams } from 'next/navigation';

export default function EditBuildingPage() {
  const params = useParams();
  const id = params.id as string;
  const [buildingName, setBuildingName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBuildingDetails = async () => {
      const building = await getBuilding(id);
      if (building) {
        setBuildingName(building.name);
      }
      setLoading(false);
    };

    fetchBuildingDetails();
  }, [id]);

  const items = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Buildings', href: '/dashboard/buildings' },
    { title: loading ? 'Loading...' : `Edit: ${buildingName}`, href: '#' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <Container fluid>
        <Center h={200}>
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Stack gap="md">
        <Breadcrumbs>{items}</Breadcrumbs>
        <Title order={2}>Edit Building: {buildingName}</Title>
        <BuildingForm buildingId={id} isEditing />
      </Stack>
    </Container>
  );
}
