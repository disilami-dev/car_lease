use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup<'a>(env: &'a Env) -> (CarLeaseContractClient<'a>, Address, Address) {
    env.mock_all_auths();

    let contract_id = env.register(CarLeaseContract, ());
    let client = CarLeaseContractClient::new(env, &contract_id);

    let owner = Address::generate(env);
    let lessee = Address::generate(env);

    (client, owner, lessee)
}

#[test]
fn adds_car_and_reads_car() {
    let env = Env::default();
    let (client, owner, _lessee) = setup(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-001"),
        &String::from_str(&env, "Tesla Model 3"),
        &100,
    );

    let car = client.get_car(&car_id);

    assert_eq!(car_id, 1);
    assert_eq!(car.id, 1);
    assert_eq!(car.owner, owner);
    assert_eq!(car.daily_rate, 100);
    assert_eq!(car.status, STATUS_AVAILABLE);
    assert_eq!(client.owner_car_count(&owner), 1);
    assert_eq!(client.owner_car_at(&owner, &0), car_id);
    assert_eq!(client.stats(), (1, 0, 2, 1));
}

#[test]
fn leases_available_car() {
    let env = Env::default();
    let (client, owner, lessee) = setup(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-002"),
        &String::from_str(&env, "Kia EV6"),
        &80,
    );

    let lease_id = client.lease_car(&lessee, &car_id, &10, &13, &240);
    let lease = client.get_lease(&lease_id);
    let car = client.get_car(&car_id);

    assert_eq!(lease_id, 1);
    assert_eq!(lease.car_id, car_id);
    assert_eq!(lease.owner, owner);
    assert_eq!(lease.lessee, lessee);
    assert_eq!(lease.total_price, 240);
    assert_eq!(lease.active, true);
    assert_eq!(car.status, STATUS_LEASED);
    assert_eq!(client.active_lease_for_car(&car_id), lease_id);
    assert_eq!(client.is_available(&car_id), false);
    assert_eq!(client.stats(), (1, 1, 2, 2));
}

#[test]
#[should_panic]
fn rejects_lease_when_payment_is_too_low() {
    let env = Env::default();
    let (client, owner, lessee) = setup(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-003"),
        &String::from_str(&env, "Honda Civic"),
        &90,
    );

    client.lease_car(&lessee, &car_id, &20, &23, &100);
}

#[test]
#[should_panic]
fn rejects_invalid_lease_period() {
    let env = Env::default();
    let (client, owner, lessee) = setup(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-004"),
        &String::from_str(&env, "Toyota Camry"),
        &70,
    );

    client.lease_car(&lessee, &car_id, &30, &30, &70);
}

#[test]
#[should_panic]
fn rejects_double_lease_for_same_car() {
    let env = Env::default();
    let (client, owner, lessee) = setup(&env);
    let second_lessee = Address::generate(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-005"),
        &String::from_str(&env, "Ford Mustang"),
        &120,
    );

    client.lease_car(&lessee, &car_id, &40, &42, &240);
    client.lease_car(&second_lessee, &car_id, &43, &45, &240);
}

#[test]
fn owner_can_mark_car_available_again() {
    let env = Env::default();
    let (client, owner, lessee) = setup(&env);

    let car_id = client.add_car(
        &owner,
        &String::from_str(&env, "VIN-STELLAR-006"),
        &String::from_str(&env, "BMW i4"),
        &150,
    );

    client.lease_car(&lessee, &car_id, &50, &52, &300);

    let car = client.mark_available(&owner, &car_id);

    assert_eq!(car.status, STATUS_AVAILABLE);
    assert_eq!(client.is_available(&car_id), true);
    assert_eq!(
        client.status_label(&STATUS_AVAILABLE),
        String::from_str(&env, "Available")
    );
}
