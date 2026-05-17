import React, { useEffect, useState } from "react";
import { checkHealth, checkStatus } from "./api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [health, setHealth] = useState("Checking backend...");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    try {
      await checkHealth();
      setHealth("Backend Healthy ✅");

      const data = await checkStatus();
      setProducts(data.products || []);
    } catch (err) {
      setHealth("Backend Unreachable ❌");
    }
  }

  function addToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="app">
      <header className="navbar">
        <h1>Apnaa Store</h1>

        <div className="cart-box">
          🛒 {cart.length} items | ${total}
        </div>
      </header>

      <div className="health">{health}</div>

      <section className="products">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <img src={product.image} alt={product.name} />

            <h2>{product.name}</h2>

            <p>${product.price}</p>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
