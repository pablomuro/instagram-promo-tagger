import dotenv from 'dotenv'
dotenv.config()

export const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

try {
  if (!process.env.BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE || !process.env.BATCH_POSTS_MINUTES_TIMEOUT_RANGE) {
    throw new Error('BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE or BATCH_POSTS_MINUTES_TIMEOUT_RANGE env variables missing')
  }
  JSON.parse(process.env.BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE)
  JSON.parse(process.env.BATCH_POSTS_MINUTES_TIMEOUT_RANGE)
} catch (error) {
  console.log(error)
  process.exit(1)
}

export const BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE = JSON.parse(process.env.BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE)

export const BATCH_POSTS_MINUTES_TIMEOUT_RANGE = JSON.parse(process.env.BATCH_POSTS_MINUTES_TIMEOUT_RANGE)

export const getBetweenPostsTimeout = () => {
  return (randomInRange(BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE[0], BETWEEN_POSTS_SECONDS_TIMEOUT_RANGE[1]) * (1000))
}

export const getBatchPostsTimeout = () => {
  return (randomInRange(BATCH_POSTS_MINUTES_TIMEOUT_RANGE[0], BATCH_POSTS_MINUTES_TIMEOUT_RANGE[1]) * (1000 * 60))
}