#[starknet::interface]
trait ICounter<TContractState> {
    fn get_counter(self: @TContractState) -> u32;
    fn increase_counter(ref self:TContractState);
}

#[starknet::contract]
mod counter_contract {

    use core::starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        counter: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_value: u32) {
        self.counter.write(initial_value.into());
    }

    // Define the event that will be emitted when the counter is increased
    #[event]
    #[derive(Drop, starknet::Event)] // Derive the event trait
    enum Event {
        // Define the variant for CounterIncreased
        CounterIncreased: CounterIncrease,
    }

    // Define the structure of the event data
    #[derive(Drop, starknet::Event)]
    struct CounterIncrease {
        #[key]
        counter: u32, // The value of the counter, marked as key
    }

    // Implement the trait
    impl counter_contract of super::ICounter<ContractState> {
        fn get_counter(self: @ContractState) -> u32 {
            self.counter.read()
        }
        fn increase_counter(ref self:ContractState){
             // Read the current value of the counter
            let current_counter = self.counter.read();

            // Increment the counter
            let new_counter = current_counter + 1;
            self.counter.write(new_counter);

            // Emit the CounterIncreased event with the updated counter value
            self.emit(Event::CounterIncreased(CounterIncrease {
                counter: new_counter,
            }));
        }

       
    }
}