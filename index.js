const cors         = require("cors");
const fs           = require("fs");
const multer       = require("multer");
const express      = require("express");
const moment       = require("moment");
const jsonwebtoken = require("jsonwebtoken");

const app = express();

const upload = multer();
const router = express.Router();

// Fake Data
const JWT_AUTH              = "JWT_AUTH";
const JWT_PASSWORD_RECOVERY = "JWT_PASSWORD_RECOVERY";

const users = [
	{
		_id      : 0,
		email    : "martin@inprodi.com",
		name     : "Mártin Alcalá",
		password : "martin123",
	},
	{
		_id      : 1,
		email    : "andres@inprodi.com",
		name     : "Andrés Murillo",
		password : "andres123",
	},
];

const jwtKey = "Fef96513e.f34$rFDSsd33F3F2";

// Helpers
class Base64 {
	/** Encodes a string to base64 */
	static encode(str) {
		return Buffer.from(str, "binary").toString("base64");
	}

	/** Decodes a string from base64 */
	static decode(str) {
		return Buffer.from(str, "base64").toString();
	}
}

const verifyTokenPromise = (token, key) => new Promise((resolve, reject) => {
	jsonwebtoken.verify(token, key, (err, decoded) => {
		if (err || !decoded) {
			return reject(err);
		}

		return resolve(decoded);
	})
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const createToken = (reason, payload) => {
	payload.created_at   = Date.now();
	payload.renovated_at = null;
	payload.expiration   = moment().add("7 days").valueOf();

	return jsonwebtoken.sign(
		{
			reason,
			data : payload,
		},
		jwtKey,
		{
			expiresIn : "7 days",
		},
	);
};

const withToken = reason => async (req, res, next) => {
	try {
		if (req.method === "HEAD" || req.method === "OPTIONS") {
			return next();
		}

		if (!req.headers.authorization) {
			return res.status(401).send({
				err : "Denied access, you have to include a token",
			});
		}

		const token  = req.headers.authorization.split(" ")[1];
		const result = await verifyTokenPromise(token, jwtKey);

		if (!result.data || !result.reason || result.reason !== reason) {
			return res.status(401).send({
				err : "Invalid token"
			});
		}

		// Add the token to locals so it can be accessed in the life
		// time of a request
		res.locals.token = result;

		return next();
	} catch (err) {
		console.error("[withToken] ", err);

		return res.status(500).send({ err });
	}
};

// App Routes
router.post("/login", upload.none(), async (req, res) => {
	try {
		const {
			email,
			password,
		} = req.body;

		const user = users.find(user => user.email === email);
		await delay(700);

		if (!user) {
			return res.status(404).send({ err : "There isn't a user with that email" });
		}

		if (user.password !== password) {
			return res.status(400).send({ err : "Incorrect password" });
		}

		await delay(700);

		const userData = {
			_id   : user._id,
			email : user.email,
			name  : user.name,
		};

		return res.status(200).send({
			token : createToken(JWT_AUTH, userData),
			user  : userData,
		});
	} catch (err) {
		console.error("[Server] /login ", err);

		return res.status(500).send({ err : "Couldn't login" });
	}
});

router.post("/recover_password", upload.none(), async (req, res) => {
	try {
		const { email } = req.body;

		const user = users.find(user => user.email === email);
		await delay(700);

		if (!user) {
			return res.status(404).send({ err : "There isn't a user with that email" });
		}

		const token = createToken(JWT_PASSWORD_RECOVERY, {
			_id   : user._id,
			email : user.email,
			name  : user.name,
		});

		return res.status(200).send({
			token,
		});
	} catch (err) {
		console.error("[Server] /recover_password ", err);

		return res.status(500).send({ err : "Couldn't recover password" });
	}
});

router.post("/reset_password", withToken(JWT_PASSWORD_RECOVERY), upload.none(), async (req, res) => {
	try {
		const { password } = req.body;

		const token = res.locals.token;
		const user  = users.find(user => user.email === token.data.email);

		await delay(700);

		if (!user) {
			throw user;
		}

		if (password === user.password) {
			return res.status(400).send({ err : "The new password can't be the same as the old password" });
		}

		// Update the password
		users[user._id].password = password;

		return res.status(200).send("ok");
	} catch (err) {
		console.error("[Server] /reset_password ", err);

		return res.status(500).send({ err : "Couldn't reset password" });
	}
});

// App Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.use("/api", router);

app.listen(4000, () => console.log("[Server] Listening on port 4000"));

