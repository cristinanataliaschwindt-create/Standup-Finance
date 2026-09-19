#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct AhorroContract;

#[contractimpl]
impl AhorroContract {
    
    // Función 1: Registrar el micro-ahorro cuando elige la opción barata
    pub fn registrar_ahorro(env: Env, usuario: Address, monto: u64) {
        
        // REGLA DE SEGURIDAD: Asegurarnos de que el usuario autorizó esto.
        // Evita que un hacker llame a la función simulando ser otra persona.
        usuario.require_auth();

        // STORAGE: Así leemos la base de datos de la blockchain.
        // Le decimos: "Traeme el valor guardado asociado a esta 'usuario' (Address)".
        // Si es la primera vez que ahorra, va a dar error, por eso usamos 'unwrap_or(0)' 
        // que significa: si no hay nada, el saldo es 0.
        let saldo_actual: u64 = env.storage().persistent().get(&usuario).unwrap_or(0);

        // Sumamos el nuevo ahorro al total que ya tenía
        let nuevo_saldo = saldo_actual + monto;

        // Guardamos el nuevo valor en la blockchain, reemplazando el anterior.
        env.storage().persistent().set(&usuario, &nuevo_saldo);
    }

    // Función 2: Para que Next.js pueda consultar cuánto ahorró y mostrarlo en pantalla
    pub fn consultar_saldo(env: Env, usuario: Address) -> u64 {
        env.storage().persistent().get(&usuario).unwrap_or(0)
    }
}