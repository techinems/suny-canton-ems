import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryItem = await prisma.inventory.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateData: Partial<{
      itemName: string | null;
      manufacturer: string | null;
      description: string | null;
      quantity: number;
      size: string | null;
      manufacturingDate: Date | null;
      purchaseDate: Date | null;
      price: number | null;
      paidBy: string | null;
      disposable: boolean | null;
      expirationDate: Date | null;
    }> = {};
    
    // Only update fields that are provided
    if (body.itemName !== undefined) updateData.itemName = body.itemName;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.manufacturingDate !== undefined) updateData.manufacturingDate = body.manufacturingDate ? new Date(body.manufacturingDate) : null;
    if (body.purchaseDate !== undefined) updateData.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.paidBy !== undefined) updateData.paidBy = body.paidBy;
    if (body.disposable !== undefined) updateData.disposable = body.disposable;
    if (body.expirationDate !== undefined) updateData.expirationDate = body.expirationDate ? new Date(body.expirationDate) : null;

    const inventoryItem = await prisma.inventory.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inventory.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}