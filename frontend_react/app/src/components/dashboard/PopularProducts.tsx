// frontend_react\app\src\components\dashboard\PopularProducts.tsx
import React from 'react';

interface Props {
  products: { name: string; sales: number }[];
}

const PopularProducts: React.FC<Props> = ({ products }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold mb-4">Most Consumed Products</h4>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Consumption</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{product.name || 'Unknown'}</td>
                <td className="border px-4 py-2">{product.sales}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="border px-4 py-2 text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PopularProducts;