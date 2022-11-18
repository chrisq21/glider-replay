import Head from 'next/head'
import Map from '../../components/Map'
import styles from './replay.module.css'
import igcData from '../../data/new/skyline'

export default function Replay() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Replay</title>
        <meta name="description" content="Replay your gliding adventures" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Map igcData={igcData} />
      </main>
    </div>
  )
}
