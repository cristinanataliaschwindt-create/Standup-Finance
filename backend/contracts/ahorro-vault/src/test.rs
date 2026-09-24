#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_inicial_es_cero() {
    let env = Env::default();
    let contract_id = env.register(AhorroContract, ());
    let client = AhorroContractClient::new(&env, &contract_id);

    let usuario = Address::generate(&env);
    
    // El saldo inicial debe ser 0
    let saldo = client.consultar_saldo(&usuario);
    assert_eq!(saldo, 0);
}

#[test]
fn test_registrar_ahorro() {
    let env = Env::default();
    env.mock_all_auths(); // Permitir validación de firmas en el test

    let contract_id = env.register(AhorroContract, ());
    let client = AhorroContractClient::new(&env, &contract_id);

    let usuario = Address::generate(&env);
    
    // Depositamos 500
    client.registrar_ahorro(&usuario, &500);
    
    // El saldo debe ser 500
    let saldo = client.consultar_saldo(&usuario);
    assert_eq!(saldo, 500);
}

#[test]
fn test_multiples_depositos_y_usuarios_separados() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AhorroContract, ());
    let client = AhorroContractClient::new(&env, &contract_id);

    let usuario1 = Address::generate(&env);
    let usuario2 = Address::generate(&env);
    
    // Usuario 1 deposita 100 y luego 250
    client.registrar_ahorro(&usuario1, &100);
    client.registrar_ahorro(&usuario1, &250);
    
    // Usuario 2 deposita 50
    client.registrar_ahorro(&usuario2, &50);
    
    // Verificaciones
    assert_eq!(client.consultar_saldo(&usuario1), 350);
    assert_eq!(client.consultar_saldo(&usuario2), 50);
}
