#![no_std]

use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    Address,
    Env,
    String,
};

#[derive(Clone)]
#[contracttype]
pub struct Car {
    pub id: u32,
    pub owner: Address,
    pub model: String,
    pub daily_price: i128,
    pub available: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Lease {
    pub id: u32,
    pub car_id: u32,
    pub renter: Address,
    pub days: u32,
    pub total_amount: i128,
}

#[contracttype]
pub enum DataKey {
    Car(u32),
    Lease(u32),
    CarCount,
    LeaseCount,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {

    pub fn add_car(
        env: Env,
        owner: Address,
        model: String,
        daily_price: i128,
    ) -> u32 {

        let mut count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::CarCount)
            .unwrap_or(0);

        count += 1;

        let car = Car {
            id: count,
            owner,
            model,
            daily_price,
            available: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Car(count), &car);

        env.storage()
            .persistent()
            .set(&DataKey::CarCount, &count);

        count
    }

    pub fn get_car(
        env: Env,
        car_id: u32,
    ) -> Car {

        env.storage()
            .persistent()
            .get(&DataKey::Car(car_id))
            .unwrap()
    }

    pub fn lease_car(
        env: Env,
        renter: Address,
        car_id: u32,
        days: u32,
    ) -> u32 {

        let mut car: Car = env
            .storage()
            .persistent()
            .get(&DataKey::Car(car_id))
            .unwrap();

        if !car.available {
            panic!("car unavailable");
        }

        car.available = false;

        env.storage()
            .persistent()
            .set(&DataKey::Car(car_id), &car);

        let mut lease_count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::LeaseCount)
            .unwrap_or(0);

        lease_count += 1;

        let lease = Lease {
            id: lease_count,
            car_id,
            renter,
            days,
            total_amount: car.daily_price * days as i128,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Lease(lease_count), &lease);

        env.storage()
            .persistent()
            .set(&DataKey::LeaseCount, &lease_count);

        lease_count
    }

    pub fn get_lease(
        env: Env,
        lease_id: u32,
    ) -> Lease {

        env.storage()
            .persistent()
            .get(&DataKey::Lease(lease_id))
            .unwrap()
    }
}

mod test;