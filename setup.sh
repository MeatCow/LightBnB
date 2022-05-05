# Regenerates the database
cat migrations/* seeds/* | sudo -u postgres psql -d lightbnb -1 -f -