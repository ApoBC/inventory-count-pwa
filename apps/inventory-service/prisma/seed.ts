import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const ERP_MOCK_URL = process.env.ERP_MOCK_URL || 'http://localhost:3005';

async function main() {
  console.log('🌱 Seeding inventory database from ERP Mock...');

  try {
    // Obtener productos desde ERP Mock
    const productsResponse = await axios.get(`${ERP_MOCK_URL}/data/Products?$top=100`);
    const erpProducts = productsResponse.data.value || [];

    console.log(`✅ Fetched ${erpProducts.length} products from ERP Mock`);

    // Limpiar datos existentes
    await prisma.stockLevel.deleteMany({});
    await prisma.product.deleteMany({});

    // Crear productos
    const createdProducts = await Promise.all(
      erpProducts.map((p: any) =>
        prisma.product.create({
          data: {
            id: p.Id,
            code: p.Code,
            name: p.Name,
            description: p.Description,
          },
        })
      )
    );

    console.log(`✅ Created ${createdProducts.length} products in local DB`);

    // Obtener stock desde ERP Mock
    const stockResponse = await axios.get(`${ERP_MOCK_URL}/data/InventoryOnHandV2?$top=1000`);
    const erpStock = stockResponse.data.value || [];

    console.log(`✅ Fetched ${erpStock.length} stock levels from ERP Mock`);

    // Crear stock levels
    const createdStocks = await Promise.all(
      erpStock.map((s: any) =>
        prisma.stockLevel.create({
          data: {
            productId: s.ItemId,
            warehouse: s.Warehouse,
            location: s.Location,
            qty: s.QuantityOnHand,
          },
        })
      )
    );

    console.log(`✅ Created ${createdStocks.length} stock levels`);

    // Log de sincronización
    await prisma.syncLog.create({
      data: {
        status: 'SUCCESS',
        message: `Synced ${createdProducts.length} products and ${createdStocks.length} stock levels`,
        itemsCount: createdProducts.length,
      },
    });

    console.log('✅ Sync log created');
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : 'Unknown error');

    // Log de error
    await prisma.syncLog.create({
      data: {
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        itemsCount: 0,
      },
    });

    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
