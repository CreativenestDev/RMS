import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getDefaultRestaurant } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const [categories, products, modifierGroups] = await Promise.all([
      db.category.findMany({
        where: { restaurantId: targetRestaurantId },
        orderBy: { sortOrder: 'asc' },
      }),
      db.product.findMany({
        where: { restaurantId: targetRestaurantId },
        orderBy: { sortOrder: 'asc' },
        include: {
          category: true,
          modifierGroupLinks: {
            include: {
              modifierGroup: {
                include: { modifiers: true },
              },
            },
          },
        },
      }),
      db.modifierGroup.findMany({
        where: { restaurantId: targetRestaurantId },
        include: { modifiers: true },
      }),
    ]);

    return NextResponse.json({ categories, products, modifierGroups });
  } catch (error: any) {
    console.error('Menu API error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const body = await req.json();
    const { type } = body;

    if (type === 'PRODUCT') {
      const {
        categoryId,
        name,
        slug,
        description,
        basePrice,
        compareAtPrice,
        imageUrl,
        dietaryFlags,
        preparationTimeMinutes,
        isFeatured,
      } = body.data;

      const product = await db.product.create({
        data: {
          restaurantId: targetRestaurantId,
          categoryId,
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description,
          basePrice: Number(basePrice) || 0,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          imageUrl,
          dietaryFlags: JSON.stringify(dietaryFlags || []),
          preparationTimeMinutes: Number(preparationTimeMinutes) || 15,
          isFeatured: Boolean(isFeatured),
        },
      });

      return NextResponse.json({ success: true, product });
    }

    if (type === 'CATEGORY') {
      const { name, slug, description, imageUrl, sortOrder } = body.data;
      const category = await db.category.create({
        data: {
          restaurantId: targetRestaurantId,
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description,
          imageUrl,
          sortOrder: Number(sortOrder) || 0,
        },
      });
      return NextResponse.json({ success: true, category });
    }

    if (type === 'MODIFIER_GROUP') {
      const { name, description, minSelections, maxSelections, isRequired, modifiers } = body.data;
      const group = await db.modifierGroup.create({
        data: {
          restaurantId: targetRestaurantId,
          name,
          description,
          minSelections: Number(minSelections) || 0,
          maxSelections: Number(maxSelections) || 1,
          isRequired: Boolean(isRequired),
          modifiers: {
            create: (modifiers || []).map((m: any) => ({
              name: m.name,
              price: Number(m.price) || 0,
              isDefault: Boolean(m.isDefault),
            })),
          },
        },
      });
      return NextResponse.json({ success: true, group });
    }

    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
  } catch (error: any) {
    console.error('Create menu entity error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create entity' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const body = await req.json();
    const { type, id, data } = body;

    if (type === 'PRODUCT_TOGGLE_AVAILABILITY') {
      const updated = await db.product.update({
        where: { id },
        data: { isAvailable: data.isAvailable },
      });
      return NextResponse.json({ success: true, product: updated });
    }

    if (type === 'CATEGORY_TOGGLE_ACTIVE') {
      const updated = await db.category.update({
        where: { id },
        data: { isActive: data.isActive },
      });
      return NextResponse.json({ success: true, category: updated });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error: any) {
    console.error('Update menu entity error:', error);
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 });
  }
}