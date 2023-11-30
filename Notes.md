- Hashing the Plain Text Password: Internally, bcrypt.compare hashes the plain text password using the same salt that was used to hash the original password (the salt is included as part of the bcrypt hash string).
- Salting: Bcrypt automatically handles the salt (a random value added to the hash to prevent precomputed hash attacks, like rainbow tables). Each password has a unique salt, which greatly increases security.
- Hashing is the process of converting an input (like a password) into a fixed-size string of characters, which is typically a sequence of numbers and letters that appears random. This is done using a hash function. The important property of a hash function is that it is a one-way process: given a hash value, it is computationally infeasible to find or reconstruct the original input (in this case, the password).
- Salting is a technique used in conjunction with hashing to enhance the security of the hash. A salt is a random value that is added to the password before hashing it. The primary purpose of a salt is to ensure that the same password will not hash to the same value every time, which helps to prevent certain types of attacks such as rainbow table attacks (precomputed tables for reversing cryptographic hash functions, typically for cracking password hashes).
- Hashing vs. Salting
    - Hashing: Takes an input and produces a fixed-length string, which is the hash. The same input will always produce the same hash.
    - Salting: Adds a unique value to the input before it is hashed to ensure the same input does not produce the same hash.
- Storing Hashed Passwords
    - Passwords are stored in a hashed format in the database for security reasons. If an attacker gains access to the database, they only find hashed values instead of plain text passwords, which are not directly usable. The attacker would have to crack the hash to retrieve the original password, which is made difficult (and ideally infeasible) by the use of a strong hash function and salting.
- bcrypt and Password Storage
  - When you create a new user account and set a password, bcrypt will perform both the salting and hashing as part of its function to secure the password. Here's what happens:
    - Salting: bcrypt generates a new, random salt every time a password is hashed.
    - Hashing: It then hashes the password together with the salt.
    - Storing the Hash: The resulting hash (which includes information about the salt) is stored in the database.
- When you use bcrypt.compare to check a password, bcrypt will:
    - Extract the Salt: Retrieve the salt from the stored hash (since it's included in the bcrypt hash string).
    - Hash the Input Password: Hash the input password with the retrieved salt.
    - Compare: Check if this newly generated hash matches the stored hash.
- What is a Token?
    - A token is a string that serves as a placeholder for the data it represents. In web authentication, particularly when using JSON Web Tokens (JWT), a token is a way to encode user information in a compact and secure manner. JWTs are composed of three parts: a header, a payload, and a signature.
        - Header: Typically consists of the type of the token (JWT) and the signing algorithm being used, such as HMAC SHA256 or RSA.
        - Payload: Contains the claims. Claims are statements about an entity (typically, the user) and additional metadata. There are three types of claims: registered, public, and private claims.
        - Signature: To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.
- How is it Useful?
    - Tokens are useful for several reasons:
        - Statelessness: Tokens enable stateless authentication. The server doesn't need to keep a record of tokens; it can validate a token and extract the user information from it directly.
        - Scalability: Because the server doesn't need to maintain a session state, it's easier to scale applications horizontally.
        - Security: Tokens can be securely transmitted through a URL, POST parameter, or an HTTP header, and are protected against tampering.
- What Does the Client Do with the Token?
  - Upon logging in, the client (usually a web browser) will receive a token from the server. The client is responsible for storing this token, often in local storage, session storage, or a cookie. For subsequent requests to the server, the client will send this token, usually as an HTTP Authorization header with the Bearer schema, to access protected routes or resources. The server will then validate the token and proceed if it's valid.


- Tokens, especially JSON Web Tokens (JWT), share some similarities with traditional session IDs, but they operate differently and are used for different purposes in web applications. Here's a comparison:
    - Session IDs:
        - Stateful: Traditional session IDs are stored on the server, either in memory or in a data store. The server uses this ID to look up session information for each request.
        - Server Load: Because the session data is stored on the server, this can increase the server's memory usage and may not scale well without additional infrastructure.
        - Cookies: Session IDs are typically sent as cookies, which the browser automatically includes with every request to the domain that set the cookie.
    - Tokens (JWT):
        - Stateless: Tokens are self-contained and include all the user information the server needs. The server doesn't need to store session data because it can decode and verify the token independently.
        - Scalability: This statelessness makes it easier to scale an application because any server in a cluster can handle the request without needing access to a shared session store.
        - Storage Flexibility: Tokens can be stored in various ways on the client-side: local storage, session storage, or cookies. They must be manually sent in HTTP headers for requests (commonly the Authorization header).
    - Key Differences:
        - Content: A session ID is just a reference ID that the server uses to look up session data. A token like JWT contains the data within it.
        - Reliance on Server: With session IDs, the server must keep track of active sessions, which can be resource-intensive. With tokens, the server typically doesn't store session state, which reduces server load and complexity.
        - Security: JWTs can be more secure than session IDs because each token is cryptographically signed. However, if a token is stolen, it can be used by an attacker in the same way as a session cookie.
    - In summary, while both tokens and session IDs are used to maintain session state across requests, tokens are designed to be self-contained, allowing for stateless application design, while session IDs require server-side storage of session data. Tokens bring scalability and flexibility benefits, especially in distributed or microservice architectures.
- Info
    ```Console
    # psql -U user -d mydatabase
    psql (16.1 (Debian 16.1-1.pgdg120+1))
    Type "help" for help.

    mydatabase=# SELECT * FROM users WHERE email = 'smarmstr@ucsc.edu'
    mydatabase-# ;
    id | username |       email       |                        password_hash                         | is_verified |            verification_token            |          crea
    ted_at           |          updated_at           
    ----+----------+-------------------+--------------------------------------------------------------+-------------+------------------------------------------+--------------
    -----------------+-------------------------------
    1 | Shawn    | smarmstr@ucsc.edu | $2b$10$jvhyvGxoggx6lcyBw0rMAebgYqdlntqi0WssNBBIxygxpCjbLI8Iy | t           | f14d331e16dfde5f3ffaff840072d24a56ffd415 | 2023-11-27 08
    :27:50.561436+00 | 2023-11-27 08:27:50.561436+00
    (1 row)
    ```

- [ ] Create error field for Login
- [ ] Create error field for Register
- [ ] Create logout button
- [ ] Create login verification needed