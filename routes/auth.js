"use strict";

const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { BadRequestError } = require("../expressError");
const { SECRET_KEY } = require("../config");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;

  if (await User.authenticate === true) {
    const token = jwt.sign({ username, password }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password");

});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;