import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const inventoryItems = await prisma.inventory.findMany({
      orderBy: {
        itemName: 'asc',
      },
    });

    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const inventoryItem = await prisma.inventory.create({
      data: {
        itemName: body.itemName,
        manufacturer: body.manufacturer,
        description: body.description,
        quantity: body.quantity,
        size: body.size,
        manufacturingDate: body.manufacturingDate ? new Date(body.manufacturingDate) : null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        price: body.price,
        paidBy: body.paidBy,
        disposable: body.disposable,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      },
    });

    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}