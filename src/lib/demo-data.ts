export const DEMO_CATEGORIES = [
  {
    id: "cat-burgers",
    name: "Crispy Zingers & Smash Burgers",
    slug: "burgers",
    description: "Hand-crafted smashed Angus beef and golden crispy buttermilk fried chicken zingers.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    sortOrder: 1,
    products: [
      {
        id: "prod-1",
        name: "Mighty Crispy Zinger Burger",
        slug: "mighty-crispy-zinger-burger",
        description: "Jumbo succulent chicken thigh fillet, seasoned in 11 secret spices, fried to crispy golden perfection, crunchy iceberg lettuce, and spicy garlic mayo on toasted brioche.",
        basePrice: 690,
        compareAtPrice: 790,
        imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 15,
        calories: 720,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: [
          {
            modifierGroup: {
              id: "mg-sauce",
              name: "Choose Your Chutney / Sauce",
              isRequired: true,
              minSelections: 1,
              maxSelections: 2,
              allowMultiple: false,
              modifiers: [
                { id: "mod-1", name: "Urban Garlic Mayo", price: 0, isAvailable: true },
                { id: "mod-2", name: "Mint & Coriander Raita", price: 0, isAvailable: true },
                { id: "mod-3", name: "Fiery Chipotle Aioli", price: 70, isAvailable: true }
              ]
            }
          },
          {
            modifierGroup: {
              id: "mg-extras",
              name: "Gourmet Add-Ons",
              isRequired: false,
              minSelections: 0,
              maxSelections: 3,
              allowMultiple: true,
              modifiers: [
                { id: "mod-4", name: "Extra Melted Cheddar Slice", price: 120, isAvailable: true },
                { id: "mod-5", name: "Crispy Fried Sunny Egg", price: 90, isAvailable: true },
                { id: "mod-6", name: "Extra Zinger Chicken Fillet", price: 320, isAvailable: true }
              ]
            }
          }
        ]
      },
      {
        id: "prod-2",
        name: "Peshawari Beef Chapli Smash Burger",
        slug: "peshawari-beef-chapli-smash-burger",
        description: "Double smashed Certified Angus beef infused with cracked coriander, pomegranate seeds, green chilies, heirloom tomato, sunny egg, and mint raita on artisanal brioche.",
        basePrice: 850,
        compareAtPrice: 950,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 18,
        calories: 840,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      },
      {
        id: "prod-3",
        name: "Double Truffle Angus Melt",
        slug: "double-truffle-angus-melt",
        description: "Double 100% prime beef patties, melted yellow cheddar, caramelized balsamic onions, garlic-sautéed mushrooms, and black truffle mayo.",
        basePrice: 1190,
        compareAtPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 16,
        calories: 910,
        dietaryFlags: JSON.stringify(["halal"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-pizzas",
    name: "Artisan & Tikka Pizzas",
    slug: "pizzas",
    description: "Slow-fermented sourdough pizzas topped with tandoori tikka, mughlai cream, and hot honey.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    sortOrder: 2,
    products: [
      {
        id: "prod-4",
        name: "Smoked Chicken Tikka Feast Pizza (Large)",
        slug: "smoked-chicken-tikka-feast-pizza",
        description: "Hand-stretched sourdough pizza loaded with charcoal-smoked chicken tikka, bell peppers, red onions, melted mozzarella, and signature tikka sauce.",
        basePrice: 1490,
        compareAtPrice: 1750,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 20,
        calories: 1350,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: [
          {
            modifierGroup: {
              id: "mg-crust",
              name: "Pizza Crust Style",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              allowMultiple: false,
              modifiers: [
                { id: "mod-7", name: "Artisan Hand-Tossed", price: 0, isAvailable: true },
                { id: "mod-8", name: "Garlic Cheese Stuffed Crust", price: 290, isAvailable: true }
              ]
            }
          }
        ]
      },
      {
        id: "prod-5",
        name: "Creamy Mughlai Crust Pizza (Large)",
        slug: "creamy-mughlai-crust-pizza",
        description: "Tender malai boti chicken chunks over rich cardamom-infused white cream sauce, mushrooms, olives, and premium mozzarella.",
        basePrice: 1590,
        compareAtPrice: 1850,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: false,
        preparationTimeMinutes: 22,
        calories: 1420,
        dietaryFlags: JSON.stringify(["halal"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-rolls",
    name: "Charcoal BBQ & Paratha Rolls",
    slug: "rolls-bbq",
    description: "Smoked Malai Boti, spicy Bihari beef strips, and chicken tikka in crispy lachha parathas.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    sortOrder: 3,
    products: [
      {
        id: "prod-6",
        name: "Special Malai Boti Paratha Roll",
        slug: "special-malai-boti-paratha-roll",
        description: "Melt-in-mouth chicken malai boti cubes barbecued over burning coal, wrapped in a flaky crispy whole-wheat lachha paratha with mint raita and pickled onions.",
        basePrice: 420,
        compareAtPrice: 480,
        imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 12,
        calories: 580,
        dietaryFlags: JSON.stringify(["halal"]),
        modifierGroupLinks: []
      },
      {
        id: "prod-7",
        name: "Bihari Beef Boti Paratha Roll",
        slug: "bihari-beef-boti-paratha-roll",
        description: "Slow-marinated spicy Bihari beef ribbons smoked to fork-tender perfection, dressed with mustard-spiced imli chutney inside a golden crispy paratha.",
        basePrice: 480,
        compareAtPrice: 550,
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: false,
        preparationTimeMinutes: 14,
        calories: 640,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-biryani",
    name: "Biryani & Desi Karahi Specials",
    slug: "biryani-karahi",
    description: "Aromatic Karachi Nalli Biryani and fresh chicken shinwari karahi cooked in pure desi ghee.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    sortOrder: 4,
    products: [
      {
        id: "prod-8",
        name: "Special Karachi Nalli Beef Biryani (Single / Double)",
        slug: "special-karachi-nalli-beef-biryani",
        description: "Long-grain aged sella basmati rice layered with tender braised beef shank and roasted bone marrow (Nalli), plum potatoes (aaloo), accompanied by zeera raita.",
        basePrice: 890,
        compareAtPrice: 990,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 15,
        calories: 950,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      },
      {
        id: "prod-9",
        name: "Shinwari Desi Chicken Karahi (Half / Full)",
        slug: "shinwari-desi-chicken-karahi",
        description: "Fresh chicken wok-cooked on intense flames with ripe red tomatoes, whole green chilies, ginger juliennes, cracked black pepper, and authentic Shinwari salt seasoning.",
        basePrice: 1450,
        compareAtPrice: 1650,
        imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 25,
        calories: 1200,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-sides",
    name: "Loaded Fries & Wings",
    slug: "sides",
    description: "Cheesy pizza fries, crispy golden wings, and spicy garlic mayo dips.",
    imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80",
    sortOrder: 5,
    products: [
      {
        id: "prod-10",
        name: "Cheesy Pizza Loaded Fries",
        slug: "cheesy-pizza-loaded-fries",
        description: "Crispy jumbo crinkle fries drenched in rich marinara, layered with spicy diced chicken tikka chunks, jalapenos, and melted double mozzarella.",
        basePrice: 620,
        compareAtPrice: 720,
        imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: false,
        preparationTimeMinutes: 12,
        calories: 780,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      },
      {
        id: "prod-11",
        name: "Peri Peri Crispy Fried Wings (6 Pcs)",
        slug: "peri-peri-crispy-fried-wings",
        description: "Crunchy double-dipped chicken wings tossed in our signature zesty lemon & herb peri-peri glaze.",
        basePrice: 480,
        compareAtPrice: 550,
        imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: false,
        preparationTimeMinutes: 14,
        calories: 620,
        dietaryFlags: JSON.stringify(["halal", "spicy"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-drinks",
    name: "Karak Chai & Cold Drinks",
    slug: "drinks",
    description: "Traditional Matka Karak Chai, Mint Margaritas, Kulfi Rabri shakes, and chilled Pakola.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    sortOrder: 6,
    products: [
      {
        id: "prod-12",
        name: "Special Matka Doodh Patti Karak Chai",
        slug: "special-matka-doodh-patti-karak-chai",
        description: "Slow-brewed rich Buffalo milk chai with crushed cardamom, saffron strands, served piping hot in an earthen clay cup (matka).",
        basePrice: 150,
        compareAtPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 8,
        calories: 180,
        dietaryFlags: JSON.stringify(["halal", "veg"]),
        modifierGroupLinks: []
      },
      {
        id: "prod-13",
        name: "Chilled Pakola Ice Cream Soda Can",
        slug: "chilled-pakola-ice-cream-soda-can",
        description: "The national taste of Pakistan - chilled emerald-green cream soda served ice-cold.",
        basePrice: 120,
        compareAtPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: false,
        preparationTimeMinutes: 2,
        calories: 140,
        dietaryFlags: JSON.stringify(["halal", "veg"]),
        modifierGroupLinks: []
      }
    ]
  },
  {
    id: "cat-desserts",
    name: "Mithai & Sweet Treats",
    slug: "desserts",
    description: "Hot Gulab Jamuns with ice cream, molten chocolate lava cake, and Nutella paratha.",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    sortOrder: 7,
    products: [
      {
        id: "prod-14",
        name: "Warm Desi Ghee Gulab Jamun with Ice Cream",
        slug: "warm-desi-ghee-gulab-jamun",
        description: "Two jumbo khoya dumplings soaked in fragrant rose and green cardamom syrup, paired with a scoop of kulfa ice cream and slivered pistachios.",
        basePrice: 320,
        compareAtPrice: 380,
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        isFeatured: true,
        preparationTimeMinutes: 5,
        calories: 420,
        dietaryFlags: JSON.stringify(["halal", "veg"]),
        modifierGroupLinks: []
      }
    ]
  }
];