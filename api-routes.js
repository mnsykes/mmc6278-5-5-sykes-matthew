const router = require("express").Router();
const db = require("./db");

router
	.route("/inventory")
	.get(async (req, res) => {
		try {
			const [inventoryItems] = await db.query(`SELECT * FROM inventory`);
			res.json(inventoryItems);
			res.status(200).end();
		} catch (err) {
			res.status(500).send("Error");
		}
	})
	.post(async (req, res) => {
		try {
			const { name, image, description, price, quantity } = req.body;
			if (!(name && image && description && price && quantity))
				return res.status(400).send("must include all items");
			await db.query(
				`
      INSERT INTO inventory (name, image, description, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `,
				[name, image, description, price, quantity]
			);

			res.status(204).end();
		} catch (err) {
			res.status(500).send("Error");
		}
	});

router
	.route("/inventory/:id")
	.get(async (req, res) => {
		try {
			const [product] = await db.query(
				`
        SELECT * FROM inventory WHERE id = ?
        `,
				req.params.id
			);

			if (!product[0]) return res.status(404).send("Item not found");
			res.json(product[0]);
			res.status(200).end();
		} catch (err) {
			res.status(500).send("Error");
		}
	})

	.put(async (req, res) => {
		try {
			const { name, image, description, price, quantity } = req.body;
			if (!(name && image && description && price && quantity))
				return res.status(404).send("must include all items");
			const [{ affectedRows }] = await db.query(
				`
        UPDATE inventory
        SET ? WHERE id = ?
        `,
				[{ name, image, description, price, quantity }],
				req.params.id
			);
			if (affectedRows === 0) return res.status(404).send("Item not found");
			res.status(204).end();
		} catch (err) {
			res.status(500).send("Error");
		}
	})
	.delete(async (req, res) => {
		try {
			const [{ affectedRows }] = await db.query(
				`
        DELETE FROM inventory WHERE id = ?
      `,
				req.params.id
			);
			if (affectedRows === 0) return res.status(404).send("not found");
			res.status(204).end();
		} catch (err) {
			res.status(500).send("Error");
		}
	});

router
	.route("/cart")
	.get(async (req, res) => {
		const [cartItems] = await db.query(
			`SELECT
        cart.id,
        cart.inventory_id AS inventoryId,
        cart.quantity,
        inventory.price,
        inventory.name,
        inventory.image,
        inventory.quantity AS inventoryQuantity
      FROM cart INNER JOIN inventory ON cart.inventory_id=inventory.id`
		);
		const [[{ total }]] = await db.query(
			`SELECT SUM(cart.quantity * inventory.price) AS total
       FROM cart, inventory WHERE cart.inventory_id=inventory.id`
		);
		res.json({ cartItems, total: total || 0 });
	})
	.post(async (req, res) => {
		const { inventoryId, quantity } = req.body;
		// Using a LEFT JOIN ensures that we always return an existing
		// inventory item row regardless of whether that item is in the cart.
		const [[item]] = await db.query(
			`SELECT
        inventory.id,
        name,
        price,
        inventory.quantity AS inventoryQuantity,
        cart.id AS cartId
      FROM inventory
      LEFT JOIN cart on cart.inventory_id=inventory.id
      WHERE inventory.id=?;`,
			[inventoryId]
		);
		if (!item) return res.status(404).send("Item not found");
		const { cartId, inventoryQuantity } = item;
		if (quantity > inventoryQuantity) return res.status(409).send("Not enough inventory");
		if (cartId) {
			await db.query(`UPDATE cart SET quantity=quantity+? WHERE inventory_id=?`, [
				quantity,
				inventoryId
			]);
		} else {
			await db.query(`INSERT INTO cart(inventory_id, quantity) VALUES (?,?)`, [
				inventoryId,
				quantity
			]);
		}
		res.status(204).end();
	})
	.delete(async (req, res) => {
		// Deletes the entire cart table
		await db.query("DELETE FROM cart");
		res.status(204).end();
	});

router
	.route("/cart/:cartId")
	.put(async (req, res) => {
		const { quantity } = req.body;
		const [[cartItem]] = await db.query(
			`SELECT
        inventory.quantity as inventoryQuantity
        FROM cart
        INNER JOIN inventory on cart.inventory_id=inventory.id
        WHERE cart.id=?`,
			[req.params.cartId]
		);
		if (!cartItem) return res.status(404).send("Not found");
		const { inventoryQuantity } = cartItem;
		if (quantity > inventoryQuantity) return res.status(409).send("Not enough inventory");
		if (quantity > 0) {
			await db.query(`UPDATE cart SET quantity=? WHERE id=?`, [quantity, req.params.cartId]);
		} else {
			await db.query(`DELETE FROM cart WHERE id=?`, [req.params.cartId]);
		}
		res.status(204).end();
	})
	.delete(async (req, res) => {
		const [{ affectedRows }] = await db.query(`DELETE FROM cart WHERE id=?`, [req.params.cartId]);
		if (affectedRows === 1) res.status(204).end();
		else res.status(404).send("Cart item not found");
	});

module.exports = router;
