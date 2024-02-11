// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// MySQL database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'mini_project'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Route to handle GET request for retrieving users
app.post('/register', async (req, res) => {
    try {
      console.log('register method called');
      const { username, email, password } = req.body;
      if(username=='' || email=='' || password==''){
        return res.status(400).json({ error: 'Please Enter all the fields' });
      }

      console.log(req.body);
  
      // Insert user into the database
      const connection = await pool.getConnection();
      const [rows]=await connection.query('select * from users where Email= ? and password= ? ',[username,email])
      connection.release();
      if(rows.length >0){
        return res.status(201).json({ message: 'User Already Exists',success:true });
      }
      await connection.query('INSERT INTO users (user_name, Email, password) VALUES (?, ?, ?)', [username, email, password]);
      connection.release();
  
      res.status(201).json({ message: 'User registered successfully',success:true });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  });
  
  app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Query the database to find the user by email and password
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users WHERE Email = ? AND password = ?', [email, password]);
        connection.release();

        // console.log('rows',rows);

        // Check if user exists and password is correct
        if (rows.length === 0) {
            return res.status(200).json({ success:false,message: 'Invalid email or password' });
        }

        res.status(200).json({ success: true ,userId:rows[0].id ,message: 'User logged in successfully', });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});
app.post('/feedback', async (req, res) => {
  try {
      const { feedback,user_id } = req.body;


      // Check if email and password are provided
      if (!feedback || !user_id) {
          return res.status(400).json({ error: 'Feedback and userId are required' });
      }

      // Query the database to find the user by email and password
      const connection = await pool.getConnection();
      await connection.query('update users set user_feedback=? where id=?', [feedback, user_id]);
      connection.release();

      res.status(200).json({ success:true,message: 'Thanks for your valuble feedback' });


      // console.log('rows',rows);

      // Check if user exists and password is correct
      // if (rows.length === 0) {
      //     return res.status(200).json({ success:false,message: 'Invalid email or password' });
      // }

  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Error logging in' });
  }
});
    
  
  app.post('/add-book', async (req, res) => {
    try {
      const { title, author, user_id,book_link,book_description,book_format} = req.body;
  
      // Insert book into the database
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO books (title, author,user_id,book_link,book_description,book_format) VALUES (?, ?,?,?,?,?)', [title, author,user_id,book_link,book_description,book_format]);
      connection.release();
  
      res.status(201).json({ message: 'Book added successfully',success:true });
    } catch (error) {
      console.error('Error adding book:', error);
      res.status(500).json({ error: 'Error adding book' });
    }
  });
  
  
  app.delete('/books/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
  
      // Delete book from the database
      const connection = await pool.getConnection();
      await connection.query('DELETE FROM books WHERE id = ?', [bookId]);
      connection.release();
  
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Error deleting book' });
    }
  });
  
  app.get('/audio-books/:user_id', async (req, res) => {
    try {
      // Fetch all books from the database
      const user_id = req.params.user_id;

      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query('SELECT * FROM books where book_format=1 and user_id=?',[user_id]);
      connection.release();
  
      res.status(200).json({ success:true,message:'Audio books retrived succsfully',books: rows });
    } catch (error) {
      console.error('Error getting books:', error);
      res.status(500).json({ error: 'Error getting books' });
    }
  });
  app.get('/text-books/:user_id', async (req, res) => {
    try {
      // Fetch all books from the database
      const user_id = req.params.user_id;
      console.log(req.params);
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query('SELECT * FROM books where book_format=0 and user_id=?',[user_id]);
      connection.release();
      console.log(rows);

  
      res.status(200).json({ success:true,message:'Text books retrived succsfully',books: rows });
    } catch (error) {
      console.error('Error getting books:', error);
      res.status(500).json({ error: 'Error getting books' });
    }
  });

  app.get('/users', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query('SELECT * FROM users');
      connection.release();
      res.status(200).json({ users: rows });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
  
  app.put('/books/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
      const { title, author } = req.body;
  
      // Update book in the database
      const connection = await pool.getConnection();
      await connection.query('UPDATE books SET title = ?, author = ? WHERE id = ?', [title, author, bookId]);
      connection.release();
  
      // res.status(200).json({ success:true,message: 'Thanks for your valuble feedback' });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Error updating book' });
    }
  });
  
  app.listen(8000, () => {
    console.log(`Server is running on port 8000`);
  });
  