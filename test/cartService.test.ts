import { createEmptyCart, addItem, removeItem, updateQuantity, countItems,isEmpty, summarize } from '../src/cartService';
import { Cart, Coupon } from '../src/types';
import { products } from '../src/mocks/fixtures';

// crear un carrito vacio
describe('test createEmptyCart', () => {
  // Test 1 - verificar que el carrito creado este vacio
  it('should create an empty cart with no items', () => {
    const id = '0';
    const userId = '0';
    const expectedCart = { id, userId, items: [] };

    const cart: Cart = createEmptyCart(id, userId);
    expect(cart).toEqual(expectedCart);
  });
});

// agregar un item al carrito
describe('test addItem', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = createEmptyCart('id-1', 'user-1');
  });

  // Test 2 - para el stock de un producto, si la cantidad es 0, no se puede agregar al carrito
  it('should throw an error if quantity is zero', () => {
    const product = products.book;
    const quantity = 0;

    expect(() => addItem(cart, product, quantity)).toThrow('Quantity must be greater than zero');

    // try {
    //  addItem(cart, product, quantity);
    // } catch (error:unknown) {
    //   if (error instanceof Error) {
    //     expect(error.message).toBe('Quantity must be greater than zero');
    //   }
    // });
  });


  // Test 3 -si no hay stock del producto, no se puede agregar al carrito
  it('should throw an error if the product is not in stock', () => {
    const product = products.laptop;
    const quantity = 5;
    expect(() => addItem(cart, product, quantity)).toThrow(`Not enough stock for ${product.name}`);
  });


  // Test 4 - si la cantidad de un producto es mayor a 10, no se puede agregar al carrito
  it('should throw an error when quantity is more than 10', () => {
    cart = addItem(cart, products.book, 8);
    const MAX_QUANTITY_PER_PRODUCT = 10;

    expect(() => addItem(cart, products.book, 5)).toThrow(
      `Cannot add more than ${MAX_QUANTITY_PER_PRODUCT} units of ${products.book.name}`
    );
  });

  // Test 5 - si el producto esta en el stock agregar al carrito
  it('should add a new product to the cart', () => {
    const updatedCart = addItem(cart, products.book, 2); // agregar producto al carrito

    expect(updatedCart.items).toHaveLength(1); // verifica que exista un solo item

    // verificar los datos del producto agregado al carrito
    expect(updatedCart.items[0].productId).toBe(products.book.id);
    expect(updatedCart.items[0].name).toBe(products.book.name);
    expect(updatedCart.items[0].unitPrice).toBe(products.book.price);
    expect(updatedCart.items[0].quantity).toBe(2);
  });

  // Test 6 - si el producto ya existe en el carrito, se debe sumar la cantidad
  it('should merge quantities for product already in the cart', () => {
   cart = addItem(cart, products.book, 2);
   cart = addItem(cart, products.book, 3);

    expect(cart.items).toHaveLength(1); // debe existit un solo item en el carrito
    expect(cart.items[0].quantity).toBe(5);  // comprobar cantidad final
  })
});



// remover un item del carrito
describe('test removeItem', () => {
  let cart: Cart;

  beforeEach(() =>{
    cart = createEmptyCart('id-1','user-1');
    cart = addItem (cart, products.book, 2);

  });


  // Test 7 - verificar que el carrito quede vacio
  it('should remove the only item from the cart', () => {
    const updatedCart = removeItem(cart, products.book.id);
   
    expect(updatedCart.items).toHaveLength(0); // verifica que el carrito quede vacio
    expect(updatedCart.id).toBe(cart.id); // no se debe modificar el id del carrito
    expect(updatedCart.userId).toBe(cart.userId); // no se debe modificar el userId del carrito
  });

  // Test 8 - verificar solo se elimine el producto a eliminar
  it('should remove an item from the cart', () => {
    const addedCart = addItem(cart, products.laptop, 1); // agregar un item al carrito
    
    const updatedCart = removeItem(addedCart, products.book.id);

    expect(updatedCart.items).toHaveLength(1); // verifica que quede un item
    expect(updatedCart.items[0].productId).toBe(products.laptop.id); // verifica que el item restante sea el laptop 
    expect(updatedCart.items[0].quantity).toBe(1); // verifica que la cantidad del item restante sea 1
    expect(updatedCart.id).toBe(cart.id); // no se debe modificar el id del carrito
    expect(updatedCart.userId).toBe(cart.userId); // no se debe modificar el userId del carrito
  });
});

// actualizar la cantidad de un item del carrito
describe('test updateItemQuantity', () => {
  let cart: Cart;  //permite asignar y reemplazar el carrito
  let updatedCart: Cart | undefined;  // permite asignar y reemplazar el carrito actualizado

// prepara un estado limpio antes de cada prueba, creando un carrito con un item agregado
  beforeEach(() =>{
    cart = createEmptyCart('id-1','user-1');
    cart = addItem (cart, products.book, 2);
    updatedCart = undefined; // reiniciar updatedCart antes de cada prueba
  });

// verifica condiciones comunes en cada prueba
     afterEach(() => {
    if (updatedCart !== undefined) {
      expect(updatedCart.id).toBe(cart.id);
      expect(updatedCart.userId).toBe(cart.userId);
    }
  });

// Test 9 - verificar que la cantidad no sea negativa
  it('should throw an error if quantity is negative', () => {
    expect(() => updateQuantity(cart, products.book.id, -1)).toThrow('Quantity cannot be negative');
  });

// Test 10 - si la cantidad es 0, se debe eliminar el item del carrito
  it('should remove the item if quantity is zero', () => {
    updatedCart = updateQuantity(cart,products.book.id,0);
    expect(updatedCart.items).toHaveLength(0); // verificar que el carrito quede vacio
    
  });

// Test 11 - si el producto no existe en el carrito, se debe lanzar un error
  it('should throw an error if the product is not in the cart', () => {
    expect(() => updateQuantity(cart, products.laptop.id, 1)).toThrow(`Product ${products.laptop.id} is not in the cart`);
  });

// Test 12 - si el producto existe en el carrito, se debe actualizar la cantidad
  it('should update the quantity of an existing item in the cart', () => {
    updatedCart = updateQuantity(cart, products.book.id, 5);
    expect(updatedCart.items).toHaveLength(1); // verificar que el carrito tenga un item
    expect(updatedCart.items[0].quantity).toBe(5); // verificar que la cantidad del item sea 5
  });
});

// Contar los items del carrito
describe('test countItems', () => {
  let cart: Cart;

beforeEach(() => {
  cart = createEmptyCart('id-1', 'user-1');
});
  
  // Test 13- si el carrito esta vacio, la cantidad de items debe ser 0
    it('should return 0 for an empty cart', () => {
    expect(countItems(cart)).toBe(0);// verifica que la cantidad de items es 0
  });


  // Test 14- contar el total de items en el carrito
  it('should count the total number of items in the car', () => {
    
    cart = addItem(cart, products.book, 2);
    cart = addItem(cart, products.laptop, 1);
    cart = addItem(cart, products.mouse, 3);

     const totalItems = countItems(cart);
     expect(totalItems).toBe(6); // verificar que la cantidad total de items en el carrito
  });

  // verificar que el carrito este vacio

  // si el carrito esta vacio, la funcion isEmpty devolvera la cantidad de items en 0
  describe('test isEmpty', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = createEmptyCart('id-1', 'user-1');
  });

  // Test 15 - devuelve valor true si el carrito esta vacío
  it('should return true for an empty cart', () => {
    expect(isEmpty(cart)).toBe(true);
  });

  // Test 16 - devuelve valor false si el carrito tiene items
  it('should return false when the cart has items', () => {
    cart = addItem(cart, products.book, 2);

    expect(isEmpty(cart)).toBe(false);
  });

  // Test 17 - devuelve valor true despues que se remueve el unico item que tenia el carrito
  it('should return true after removing the only item', () => {
    cart = addItem(cart, products.book, 2);
    cart = removeItem(cart, products.book.id);

    expect(isEmpty(cart)).toBe(true);
  });

});
});

// 

describe('test summarize',()=>{
  let cart: Cart;

  const now = new Date('2026-09-03T00:00:00.000Z');

  beforeEach(()=>{
    cart = createEmptyCart('id-1', 'user-1');
  }) 

  // Test 18- deberia devolver 0 para un empty cart
  it('should return zero values for an empty cart', () => {
    const summary = summarize(cart, { now });

    expect(summary).toEqual({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    });
  });

  // Test 19 - calcular el total de un producto
  it('should calculate the subtotal for one product', () => {
    cart = addItem(cart, products.book, 2);

    const summary = summarize(cart, { now });

    expect(summary.subtotal).toBe(products.book.price * 2);
  });
  
  // Test 20 - calcula los subtotales
  it('should calculate the subtotal for multiple products', () => {
    cart = addItem(cart, products.book, 2);
    cart = addItem(cart, products.mouse, 3);

    const expectedSubtotal =
      products.book.price * 2 +
      products.mouse.price * 3;

    const summary = summarize(cart, { now });

    expect(summary.subtotal).toBe(expectedSubtotal);
  });


  // Test 21 - si no hay cupón devuelve 0 en descuento
  it('should return zero discount when no coupon is provided', () => {
    cart = addItem(cart, products.book, 2);

    const summary = summarize(cart, { now });

    expect(summary.discount).toBe(0);
  });

  // Test 22 - verificar que calcule el total
  it('should calculate the total correctly', () => {
    cart = addItem(cart, products.book, 2);

    const summary = summarize(cart, { now });

    expect(summary.total).toBe(
      summary.subtotal - summary.discount + summary.shipping
    );
  });
});
