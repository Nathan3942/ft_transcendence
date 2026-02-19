


if [ -z "$1" ]; then
    echo "Usage: ./delete_matches.sh NOMBRE"
    exit 1
fi

COUNT=$1

for ((i=11; i<=COUNT; i++)); do
    echo "Suppression match $i"
    curl -i -X DELETE http://192.168.1.40:3000/api/v1/matches/$i
    echo "----------------------------"
done

echo "Terminé !"