#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
}

#[contract]
pub struct AhorroContract;

#[contractimpl]
impl AhorroContract {
    pub fn registrar_ahorro(env: Env, usuario: Address, monto: u64) {
        usuario.require_auth();
        let key = DataKey::Balance(usuario.clone());
        let saldo_actual: u64 = env.storage().persistent().get(&key).unwrap_or(0);
        let nuevo_saldo = saldo_actual + monto;
        env.storage().persistent().set(&key, &nuevo_saldo);
    }

    pub fn consultar_saldo(env: Env, usuario: Address) -> u64 {
        let key = DataKey::Balance(usuario);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}

mod test;