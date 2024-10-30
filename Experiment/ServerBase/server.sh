# Implementa una interfaz para iniciar o finalizar docker-compose 

# Inicializa el docker-compose
start() {
    docker-compose up -d
}

# Finaliza el docker-compose
stop() {
    docker-compose down
}

# Muestra el estado del docker-compose
status() {
    docker-compose ps
}

# Muestra la ayuda
help() {
    echo "Uso: $0 [start|stop|status|help]"
    echo "start: Inicia el docker-compose"
    echo "stop: Finaliza el docker-compose"
    echo "status: Muestra el estado del docker-compose"
    echo "help: Muestra esta ayuda"
}

# Verifica que se haya pasado un argumento
if [ $# -eq 0 ]; then
    echo "Error: Se requiere un argumento"
    help
    exit 1
fi

# Verifica que el argumento sea válido
case $1 in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    help)
        help
        ;;
    *)
        echo "Error: Argumento inválido"
        help
        exit 1
        ;;
esac

exit 0

# Fin del script