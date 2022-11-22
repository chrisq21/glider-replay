import Head from 'next/head'
import CMap from '../../components/CMap'
import styles from './cesium.module.css'
import igcData from '../../data/new/arizona'

export default function Replay() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Replay</title>
        <meta name="description" content="Replay your gliding journey" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <CMap igcData={igcData} />
      </main>
    </div>
  )
}
