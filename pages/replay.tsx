import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Replay() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Replay</title>
        <meta name="description" content="Replay your gliding adventures" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Replay</h1>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}
