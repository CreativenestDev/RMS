import type { Metadata } from 'next';
import './globals.css';
import { getDefaultRestaurant } from '@/lib/tenant';
import { CartProvider } from '@/lib/cart-context';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const restaurant = await getDefaultRestaurant();
    return {
      title: `${restaurant.name} | Gourmet Food Delivery & Pickup`,
      description: `Order online from ${restaurant.name}. Hand-crafted smashed burgers, artisan pizzas, crispy chicken, and decadent desserts delivered fresh.`,
      openGraph: {
        title: `${restaurant.name} | Delicious Online Ordering`,
        description: `Browse the complete menu and order online from ${restaurant.name}.`,
        images: restaurant.coverUrl ? [restaurant.coverUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Restaurant Online Ordering',
      description: 'Order food online with fast delivery and easy pickup.',
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let primaryColor = '#ea580c';
  let secondaryColor = '#0f172a';

  try {
    const restaurant = await getDefaultRestaurant();
    primaryColor = restaurant.primaryColor || '#ea580c';
    secondaryColor = restaurant.secondaryColor || '#0f172a';
  } catch (e) {
    // fallback if db is not ready yet
  }

  return (
    <html
      lang="en"
      style={
        {
          '--primary': primaryColor,
          '--primary-hover': primaryColor,
          '--secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      <body className="min-h-screen flex flex-col antialiased bg-[#fafafa] text-gray-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}