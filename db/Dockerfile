FROM library/postgres:10-alpine
COPY init.sql /docker-entrypoint-initdb.d/
COPY test_data.sql /docker-entrypoint-initdb.d/
COPY init.sh /docker-entrypoint-initdb.d/
ENV POSTGRES_PASSWORD=Monaco
