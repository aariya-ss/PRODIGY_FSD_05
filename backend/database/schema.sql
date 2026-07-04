-- Supabase SQL Editor Script for E-Commerce Database Setup

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS profiles;

-- 1. Profiles Table (syncs with Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- Matches Supabase Auth user id
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- Add indexes for performance optimization
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Insert some default mock products
INSERT INTO products (name, description, price, category, stock, image_url, featured) VALUES
('Classic Blue Denim Jacket', 'A timeless classic denim jacket crafted from premium blue cotton. Featuring dual chest pockets, adjustable button waist, and a comfortable, relaxed fit.', 89.99, 'Apparel', 25, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', true),
('Premium Wireless Headphones', 'Immerse yourself in rich, high-fidelity sound. Features active noise cancellation (ANC), 40-hour battery life, and comfortable memory foam ear cups.', 199.99, 'Electronics', 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', true),
('Ergonomic Office Chair', 'Upgrade your work-from-home setup with our premium ergonomic mesh office chair. Offers lumbar support, adjustable 3D armrests, and dynamic tilt functionality.', 249.50, 'Furniture', 10, 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80', false),
('Stainless Steel Water Bottle', 'Double-walled vacuum insulated water bottle that keeps your drinks ice cold for 24 hours or piping hot for 12 hours. leak-proof cap.', 24.99, 'Accessories', 50, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', true),
('Minimalist Leather Wallet', 'Sleek RFID-blocking card holder wallet crafted from genuine full-grain leather. Comfortably fits up to 8 cards and cash.', 39.99, 'Accessories', 35, 'https://images.unsplash.com/photo-1627124118974-1d80dd4c9447?w=600&auto=format&fit=crop&q=80', false),
('Mechanical Gaming Keyboard', 'Tactile blue switches, customizable RGB backlighting, full anti-ghosting keys, and a premium aluminum frame for serious gamers.', 79.99, 'Electronics', 20, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80', false);
