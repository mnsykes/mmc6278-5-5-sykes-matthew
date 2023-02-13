const {expect} = require('chai')
const request = require('supertest')
const app = require('../app')
const db = require('../db')
const fs = require('fs/promises')

const cart = {
  cartItems: [
    {
      inventoryId: 1,
      quantity: 1,
      price: 599.99,
      name: 'Stratocaster',
      image: 'strat.jpg',
      inventoryQuantity: 3
    },
    {
      inventoryId: 6,
      quantity: 1,
      price: 29.99,
      name: 'Strap',
      image: 'strap.jpg',
      inventoryQuantity: 20
    },
    {
      inventoryId: 7,
      quantity: 1,
      price: 9.99,
      name: 'Assortment of Picks',
      image: 'picks.jpg',
      inventoryQuantity: 50
    },
    {
      inventoryId: 9,
      quantity: 1,
      price: 19.99,
      name: 'Instrument Cable',
      image: 'cable.jpg',
      inventoryQuantity: 15
    },
    {
      inventoryId: 2,
      quantity: 1,
      price: 49.99,
      name: 'Mini Amp',
      image: 'amp.jpg',
      inventoryQuantity: 10
    }
  ],
  total: 709.95
}

const inventory = [
  {
    id: 1,
    name: 'Stratocaster',
    image: 'strat.jpg',
    description: 'One of the most iconic electric guitars ever made.',
    price: 599.99,
    quantity: 3
  },
  {
    id: 2,
    name: 'Mini Amp',
    image: 'amp.jpg',
    description: "A small practice amp that shouldn't annoy roommates or neighbors.",
    price: 49.99,
    quantity: 10
  },
  {
    id: 3,
    name: 'Bass Guitar',
    image: 'bass.jpg',
    description: 'A four string electric bass guitar.',
    price: 399.99,
    quantity: 10
  },
  {
    id: 4,
    name: 'Acoustic Guitar',
    image: 'acoustic.jpg',
    description: 'Perfect for campfire sing-alongs.',
    price: 799.99,
    quantity: 4
  },
  {
    id: 5,
    name: 'Ukulele',
    image: 'ukulele.jpg',
    description: 'A four string tenor ukulele tuned GCEA.',
    price: 99.99,
    quantity: 15
  },
  {
    id: 6,
    name: 'Strap',
    image: 'strap.jpg',
    description: 'Woven instrument strap keeps your guitar or bass strapped to you to allow playing while standing.',
    price: 29.99,
    quantity: 20
  },
  {
    id: 7,
    name: 'Assortment of Picks',
    image: 'picks.jpg',
    description: 'Picks for acoustic or electric players.',
    price: 9.99,
    quantity: 50
  },
  {
    id: 8,
    name: 'Guitar Strings',
    image: 'strings.jpg',
    description: 'High quality wound strings for your acoustic or electric guitar or bass.',
    price: 12.99,
    quantity: 20
  },
  {
    id: 9,
    name: 'Instrument Cable',
    image: 'cable.jpg',
    description: 'A cable to connect an electric guitar or bass to an amplifier.',
    price: 19.99,
    quantity: 15
  }
]

describe('e-commerce site', () => {
  after(async () => db.end())
  describe('static files', () => {
    const files = [
      'index.html',
      'cart.html',
      'product.html',
      'style.css',
      'index.js'
    ]
    for (const file of files) {
      it(`/${file} should serve ${file}`, async () => {
        const response = await request(app)
          .get(`/${file}`)
        expect(response.status).to.eq(200)
        const fileText = await fs.readFile(`public/${file}`, 'UTF-8')
        expect(response.text).to.eq(fileText)
      })
    }
    const images = [
      'acoustic',
      'bass',
      'picks',
      'strat',
      'ukulele',
      'amp',
      'cable',
      'strap',
      'strings',
    ]
    for (const image of images) {
      it(`/images/${image}.jpg should serve ${image} image`, async () => {
        const response = await request(app)
          .get(`/images/${image}.jpg`)
        expect(response.status).to.eq(200)
        expect(response.headers['content-type']).to.eq('image/jpeg')
      })
    }
  })
  describe('e-commerce api', () => {
    describe('inventory', () => {
      const item = {
        name: 'strawberry',
        price: 3,
        quantity: 1,
        description: 'a red fruit',
        image: 'https://picsum.photos/id/1080/200/300'
      }
      afterEach(async () => {
        await db.query('DELETE FROM inventory WHERE id > 9;')
      })
      it('GET /api/inventory returns all inventory and 200 ', async () => {
        const res = await request(app)
          .get('/api/inventory')
        expect(res.status).to.eq(200)
        expect(res.body).to.deep.eq(inventory)
      })
      it('GET /api/inventory/1 returns item with id 1 and 200 ', async () => {
        const res = await request(app)
          .get('/api/inventory/1')
        expect(res.status).to.eq(200)
        expect(res.body).to.deep.eq(inventory[0])
      })
      it('GET /api/inventory/:id with a non-existent id returns a 404', async () => {
        const res = await request(app)
          .get('/api/inventory/banana')
        expect(res.status).to.eq(404)
      })
      it('POST /api/inventory creates an item and returns 204', async () => {
        const res = await request(app)
          .post('/api/inventory')
          .send(item)
        expect(res.status).to.eq(204)
        const [[addedItem]] = await db.query('SELECT * FROM inventory WHERE name = "strawberry";')
        const {id, ...addedItemMinusId} = addedItem
        expect(addedItemMinusId).to.deep.eq(item)
      })
      it('PUT /api/inventory/:id updates an item and returns 204', async () => {
        const {name, price, image, description, quantity} = item
        await db.query('INSERT INTO inventory (name, price, image, description, quantity) values (?, ?, ?, ?, ?)', [
          name, price, image, description, quantity
        ])
        const [[addedItem]] = await db.query('SELECT * FROM inventory WHERE name = "strawberry";')
        const res = await request(app)
          .put(`/api/inventory/${addedItem.id}`)
          .send({...item, quantity: 3})
        expect(res.status).to.eq(204)
        const [[updatedItem]] = await db.query('SELECT * FROM inventory WHERE name = "strawberry";')
        const {id, ...updatedItemMinusId} = updatedItem
        expect(updatedItemMinusId).to.deep.eq({...item, quantity: 3})
      })
      it('PUT /api/inventory/:id with non-existent id returns 404', async () => {
        const res = await request(app)
          .put(`/api/inventory/99`)
          .send(item)
        expect(res.status).to.eq(404)
      })
      it('DELETE /api/inventory/:id deletes an item and returns 204 ', async () => {
        const {name, price, image, description, quantity} = item
        await db.query('INSERT INTO inventory (name, price, image, description, quantity) values (?, ?, ?, ?, ?)', [
          name, price, image, description, quantity
        ])
        const [[addedItem]] = await db.query('SELECT * FROM inventory WHERE name = "strawberry";')
        const res = await request(app)
          .delete(`/api/inventory/${addedItem.id}`)
        expect(res.status).to.eq(204)
        const [[deletedItem]] = await db.query('SELECT * FROM inventory WHERE name = "strawberry";')
        expect(deletedItem).to.not.exist
      })
      it('DELETE /api/inventory/:id with non-existent id returns 404', async () => {
        const res = await request(app)
          .delete(`/api/inventory/99`)
          .send(item)
        expect(res.status).to.eq(404)
      })
    })
    describe('cart', () => {
      beforeEach(async () => {
        await db.query(`DELETE FROM cart;`)
        await db.query(`
          INSERT INTO cart (inventory_id, quantity)
          VALUES
            (1,1),
            (6,1),
            (7,1),
            (9,1),
            (2,1);
        `)
      })
      it('GET /api/cart should return cart data and 200', async () => {
        const res = await request(app)
          .get('/api/cart')
        expect(res.status).to.eq(200)
        expect(res.body.cartItems.map(({id, ...item}) => item)).to.deep.eq(cart.cartItems)
        expect(res.body.total).to.deep.eq(cart.total)
      })
      it('POST /api/cart should add to cart and return 204', async () => {
        const newCartItem = {
          inventoryId: 5,
          quantity: 1,
        }
        const res = await request(app)
          .post('/api/cart')
          .send(newCartItem)
        const [[addedItem]] = await db.query('SELECT quantity, inventory_id AS inventoryId FROM cart WHERE inventory_id = 5')
        expect(res.status).to.eq(204)
        expect(newCartItem).to.deep.eq(addedItem)
      })
      it('POST /api/cart should return 404 if inventory item does not exist', async () => {
        const newCartItem = {
          inventoryId: 99,
          quantity: 1,
        }
        const res = await request(app)
          .post('/api/cart')
          .send(newCartItem)
        const [[addedItem]] = await db.query('SELECT quantity, inventory_id AS inventoryId FROM cart WHERE inventory_id = 5')
        expect(res.status).to.eq(404)
        expect(addedItem).to.not.exist
      })
      it('POST /api/cart should return 409 if item quantity is insufficient', async () => {
        const newCartItem = {
          inventoryId: 5,
          quantity: 99,
        }
        const res = await request(app)
          .post('/api/cart')
          .send(newCartItem)
        const [[addedItem]] = await db.query('SELECT quantity, inventory_id AS inventoryId FROM cart WHERE inventory_id = 5')
        expect(res.status).to.eq(409)
        expect(addedItem).to.not.exist
      })
      it('PUT /api/cart/:id should change cart quantity and return 204', async () => {
        const itemToChange = {
          inventory_id: 3,
          quantity: 2,
        }
        await db.query(`INSERT INTO cart (inventory_id, quantity) VALUES (3,3)`)
        const [[addedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        const res = await request(app)
          .put(`/api/cart/${addedItem.id}`)
          .send(itemToChange)
        expect(res.status).to.eq(204)
        const [[changedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        expect(changedItem).to.deep.eq({...addedItem, ...itemToChange})
      })
      it('PUT /api/cart/:id should return 404 if cart item does not exist', async () => {
        const itemToChange = {
          inventory_id: 3,
          quantity: 2,
        }
        await db.query(`INSERT INTO cart (inventory_id, quantity) VALUES (3,3)`)
        const [[addedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        const res = await request(app)
          .put(`/api/cart/99`)
          .send(itemToChange)
        expect(res.status).to.eq(404)
        const [[unchangedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        expect(unchangedItem).to.deep.eq(addedItem)
      })
      it('PUT /api/cart/:id should return 409 if inventory quantity insufficient', async () => {
        const itemToChange = {
          inventory_id: 3,
          quantity: 99,
        }
        await db.query(`INSERT INTO cart (inventory_id, quantity) VALUES (3,3)`)
        const [[addedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        const res = await request(app)
          .put(`/api/cart/${addedItem.id}`)
          .send(itemToChange)
        expect(res.status).to.eq(409)
        const [[unchangedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        expect(unchangedItem).to.deep.eq(addedItem)
      })
      it('DELETE /api/cart/:id should remove cart item and return 204', async () => {
        await db.query(`INSERT INTO cart (inventory_id, quantity) VALUES (3,3)`)
        const [[addedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        const res = await request(app)
          .delete(`/api/cart/${addedItem.id}`)
        expect(res.status).to.eq(204)
        const [[deletedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        expect(deletedItem).to.not.exist
      })
      it('DELETE /api/cart/:id should return 404 if cart item does not exist', async () => {
        await db.query(`INSERT INTO cart (inventory_id, quantity) VALUES (3,3)`)
        const [[addedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        const res = await request(app)
          .delete(`/api/cart/99`)
        expect(res.status).to.eq(404)
        const [[undeletedItem]] = await db.query(`SELECT * FROM cart WHERE inventory_id=3`)
        expect(addedItem).to.deep.eq(undeletedItem)
      })
      it('DELETE /api/cart/ should empty cart and return 204', async () => {
        const res = await request(app)
          .delete(`/api/cart`)
        expect(res.status).to.eq(204)
        const [[{count}]] = await db.query(`SELECT count(*) as count FROM cart`)
        expect(count).to.eq(0)
      })
    })
  })
})
