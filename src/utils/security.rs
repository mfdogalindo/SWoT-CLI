use rand::distr::{Alphanumeric, DistString};
use rand::thread_rng;

pub(crate) fn generate_random_string(length: usize) -> String {
    Alphanumeric.sample_string(&mut thread_rng(), length)
}