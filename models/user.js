"use strict";

const bcrypt = require("bcrypt");

const db = require("../db");

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const { BadRequestError, NotFoundError } = require("../expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bycript.hash(
      password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING username`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.json(result.rows[0]);
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    let isValid = false;

    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        isValid = true;
      }
    }

    return isValid;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1
        RETURNING username, last_login_at`, [username]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such message: ${username}`);

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
        FROM users
        ORDER BY username`);

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`, [username]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`)
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    // user info
    const mResults = await db.query(
      `SELECT m.id,
        (SELECT u.username, u.first_name, u.last_name, u.phone
          FROM users AS u
          WHERE u.username = m.to_username), m.body, m.sent_at, m.read_at
        FROM messages AS m
        WHERE m.from_username = $1`, [username]
    );

    const messages = mResults.rows;
    return res.json();
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const uResults = await db.query(
      `SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1`, [username]
    );

    const user = uResults.rows[0];

    const mResults = await db.query(
      `SELECT id, from_user, body, sent_at, read_at
        FROM message
        WHERE to_username = $1`, [username]
    );

    const messages = mResults.rows;

    return messages


  }
}


module.exports = User;
