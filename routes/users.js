"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async function (req, res, next) {

  const users = await User.all();
  return res.json(users);
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get(
  '/:username',
  ensureCorrectUser,
  async function (req, res, next) {

  const username = req.params.username;
  const user = await User.get(username); // returns user

  // TODO: this error is already thrown in the model
  if (!user) throw new NotFoundError(`${username} not found!`);
  return res.json(user);
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

// TODO: move the middleware to view functions
router.get('/:username/to', async function (req, res, next) {
  const username = req.params.username;
  ensureCorrectUser;

  const messages = await User.messagesTo(username);

  // TODO: this error is already thrown in the model
  if (!messages) throw new NotFoundError(`${username} not found!`);
  return res.json(messages);
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async function (req, res, next) {
  const username = req.params.username;
  ensureCorrectUser;

  const messages = await User.messagesFrom(username);

  // TODO: this error is already thrown in the model
  if (!messages) throw new NotFoundError(`${username} not found!`);
  return res.json(messages);
});

module.exports = router;