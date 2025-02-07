# Dockerfile

# --- Stage 1: Build the App Front-End ---
    FROM node:latest AS builder
    WORKDIR /project
    # Copy the entire repository into the builder stage.
    COPY . .
    # For building the front-end, copy the front-end package.json (from the app folder) into the root.
    RUN cp app/package.json package.json
    # Install front-end dependencies (this installs mini-css-extract-plugin and others into /project/node_modules)
    RUN npm install
    # Run the build command.
    # Since webpack.config.js is in /project, its entry paths like "./app/scripts/main.js" will be resolved correctly.
    RUN npm run build
    # After build, the static files are in /project/dist
    
    # --- Stage 2: Production Image ---
    FROM debian:latest
    
    # Update OS and install required packages
    RUN apt-get update && apt-get upgrade -y && \
        apt-get install -y \
          mariadb-server \
          nginx \
          nodejs \
          npm \
          python3 \
          python3-pip \
          python3-venv && \
        apt-get clean
    
    # Install PM2 globally to manage the API process
    RUN npm install -g pm2
    
    # Create a Python virtual environment and install dependencies for the DB setup script
    RUN python3 -m venv /app/venv && \
        /app/venv/bin/pip install --upgrade pip && \
        /app/venv/bin/pip install python-dotenv mysql-connector-python
    
    WORKDIR /app
    
    # --- API Setup ---
    # Copy the API source files (from the api folder) into /app.
    COPY ./api/index.js /app/
    COPY ./api/package*.json /app/
    RUN npm install
    
    # --- App Setup ---
    # Copy the built front-end files from the builder stage (located in /project/dist) to the Nginx served folder.
    COPY --from=builder /project/dist /var/www/html
    
    # --- Additional Files ---
    # Copy the SQL script, Python DB setup script, and Nginx configuration.
    COPY ./database.sql /app/
    COPY ./create_tables_db.py /app/
    COPY ./default.conf /etc/nginx/sites-available/default
    
    # --- Environment Variables ---
    # Create the .env file with your API and MariaDB settings.
    RUN echo "API_PORT=3000" >> /app/.env && \
        echo "MARIADB_ROOT_PASSWORD=123456" >> /app/.env && \
        echo "MARIADB_DATABASE=to-do-db" >> /app/.env && \
        echo "MARIADB_USER=to-do-user" >> /app/.env && \
        echo "MARIADB_PASSWORD=654321" >> /app/.env
    
    # Expose port 80 for Nginx.
    EXPOSE 80
    
    # --- Entrypoint ---
    # Copy the entrypoint script, set execute permissions, and specify it as the container entrypoint.
    COPY ./entrypoint.sh /entrypoint.sh
    RUN chmod +x /entrypoint.sh
    ENTRYPOINT ["/entrypoint.sh"]
    