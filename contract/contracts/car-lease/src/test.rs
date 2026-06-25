#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_add_and_get_car() {
    let env = Env::default();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "Tesla Model 3"),
        &100,
    );

    assert_eq!(car_id, 1);

    let car = client.get_car(&1);

    assert_eq!(car.id, 1);
    assert_eq!(car.daily_price, 100);
    assert!(car.available);
}

#[test]
fn test_lease_car() {
    let env = Env::default();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let renter = Address::generate(&env);

    client.add_car(
        &owner,
        &String::from_str(&env, "BMW X5"),
        &200,
    );

    let lease_id = client.lease_car(
        &renter,
        &1,
        &3,
    );

    assert_eq!(lease_id, 1);

    let lease = client.get_lease(&1);

    assert_eq!(lease.id, 1);
    assert_eq!(lease.car_id, 1);
    assert_eq!(lease.days, 3);
    assert_eq!(lease.total_amount, 600);

    let car = client.get_car(&1);

    assert!(!car.available);
}