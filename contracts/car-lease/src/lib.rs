#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String};

const STATUS_AVAILABLE: u32 = 1;
const STATUS_LEASED: u32 = 2;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CarLeaseError {
    CarNotFound = 1,
    LeaseNotFound = 2,
    CarNotAvailable = 3,
    InvalidLeasePeriod = 4,
    PaymentTooLow = 5,
    NotCarOwner = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Car {
    pub id: u32,
    pub owner: Address,
    pub vin: String,
    pub model: String,
    pub daily_rate: i128,
    pub status: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lease {
    pub id: u32,
    pub car_id: u32,
    pub owner: Address,
    pub lessee: Address,
    pub start_ledger: u32,
    pub end_ledger: u32,
    pub total_price: i128,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    NextCarId,
    NextLeaseId,
    TotalCars,
    TotalLeases,
    Car(u32),
    Lease(u32),
    ActiveLeaseForCar(u32),
    OwnerCarCount(Address),
    OwnerCarAt(Address, u32),
}

#[contract]
pub struct CarLeaseContract;

#[contractimpl]
impl CarLeaseContract {
    pub fn add_car(env: Env, owner: Address, vin: String, model: String, daily_rate: i128) -> u32 {
        owner.require_auth();

        let next_id = Self::next_car_id(&env);

        let car = Car {
            id: next_id,
            owner: owner.clone(),
            vin,
            model,
            daily_rate,
            status: STATUS_AVAILABLE,
        };

        env.storage().persistent().set(&DataKey::Car(next_id), &car);

        let owner_count = Self::owner_car_count(env.clone(), owner.clone());

        env.storage()
            .persistent()
            .set(&DataKey::OwnerCarAt(owner.clone(), owner_count), &next_id);

        env.storage()
            .persistent()
            .set(&DataKey::OwnerCarCount(owner), &(owner_count + 1));

        env.storage()
            .persistent()
            .set(&DataKey::NextCarId, &(next_id + 1));

        let total_cars = Self::total_cars(&env);

        env.storage()
            .persistent()
            .set(&DataKey::TotalCars, &(total_cars + 1));

        next_id
    }

    pub fn get_car(env: Env, car_id: u32) -> Car {
        Self::read_car(&env, car_id)
    }

    pub fn lease_car(
        env: Env,
        lessee: Address,
        car_id: u32,
        start_ledger: u32,
        end_ledger: u32,
        payment: i128,
    ) -> u32 {
        lessee.require_auth();

        if end_ledger <= start_ledger {
            env.panic_with_error(CarLeaseError::InvalidLeasePeriod);
        }

        let mut car = Self::read_car(&env, car_id);

        if car.status != STATUS_AVAILABLE {
            env.panic_with_error(CarLeaseError::CarNotAvailable);
        }

        let total_price = ((end_ledger - start_ledger) as i128) * car.daily_rate;

        if payment < total_price {
            env.panic_with_error(CarLeaseError::PaymentTooLow);
        }

        let lease_id = Self::next_lease_id(&env);

        let lease = Lease {
            id: lease_id,
            car_id,
            owner: car.owner.clone(),
            lessee,
            start_ledger,
            end_ledger,
            total_price,
            active: true,
        };

        car.status = STATUS_LEASED;

        env.storage().persistent().set(&DataKey::Car(car_id), &car);
        env.storage()
            .persistent()
            .set(&DataKey::Lease(lease_id), &lease);
        env.storage()
            .persistent()
            .set(&DataKey::ActiveLeaseForCar(car_id), &lease_id);
        env.storage()
            .persistent()
            .set(&DataKey::NextLeaseId, &(lease_id + 1));

        let total_leases = Self::total_leases(&env);

        env.storage()
            .persistent()
            .set(&DataKey::TotalLeases, &(total_leases + 1));

        lease_id
    }

    pub fn get_lease(env: Env, lease_id: u32) -> Lease {
        Self::read_lease(&env, lease_id)
    }

    pub fn active_lease_for_car(env: Env, car_id: u32) -> u32 {
        let value: Option<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::ActiveLeaseForCar(car_id));

        match value {
            Some(lease_id) => lease_id,
            None => env.panic_with_error(CarLeaseError::LeaseNotFound),
        }
    }

    pub fn mark_available(env: Env, owner: Address, car_id: u32) -> Car {
        owner.require_auth();

        let mut car = Self::read_car(&env, car_id);

        if car.owner != owner {
            env.panic_with_error(CarLeaseError::NotCarOwner);
        }

        car.status = STATUS_AVAILABLE;

        env.storage().persistent().set(&DataKey::Car(car_id), &car);

        car
    }

    pub fn owner_car_count(env: Env, owner: Address) -> u32 {
        let value: Option<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerCarCount(owner));

        value.unwrap_or(0)
    }

    pub fn owner_car_at(env: Env, owner: Address, index: u32) -> u32 {
        let value: Option<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerCarAt(owner, index));

        match value {
            Some(car_id) => car_id,
            None => env.panic_with_error(CarLeaseError::CarNotFound),
        }
    }

    pub fn is_available(env: Env, car_id: u32) -> bool {
        let car = Self::read_car(&env, car_id);
        car.status == STATUS_AVAILABLE
    }

    pub fn stats(env: Env) -> (u32, u32, u32, u32) {
        (
            Self::total_cars(&env),
            Self::total_leases(&env),
            Self::next_car_id(&env),
            Self::next_lease_id(&env),
        )
    }

    pub fn status_label(env: Env, status: u32) -> String {
        if status == STATUS_AVAILABLE {
            return String::from_str(&env, "Available");
        }

        if status == STATUS_LEASED {
            return String::from_str(&env, "Leased");
        }

        String::from_str(&env, "Unknown")
    }

    fn read_car(env: &Env, car_id: u32) -> Car {
        let value: Option<Car> = env.storage().persistent().get(&DataKey::Car(car_id));

        match value {
            Some(car) => car,
            None => env.panic_with_error(CarLeaseError::CarNotFound),
        }
    }

    fn read_lease(env: &Env, lease_id: u32) -> Lease {
        let value: Option<Lease> = env.storage().persistent().get(&DataKey::Lease(lease_id));

        match value {
            Some(lease) => lease,
            None => env.panic_with_error(CarLeaseError::LeaseNotFound),
        }
    }

    fn next_car_id(env: &Env) -> u32 {
        let value: Option<u32> = env.storage().persistent().get(&DataKey::NextCarId);
        value.unwrap_or(1)
    }

    fn next_lease_id(env: &Env) -> u32 {
        let value: Option<u32> = env.storage().persistent().get(&DataKey::NextLeaseId);
        value.unwrap_or(1)
    }

    fn total_cars(env: &Env) -> u32 {
        let value: Option<u32> = env.storage().persistent().get(&DataKey::TotalCars);
        value.unwrap_or(0)
    }

    fn total_leases(env: &Env) -> u32 {
        let value: Option<u32> = env.storage().persistent().get(&DataKey::TotalLeases);
        value.unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
