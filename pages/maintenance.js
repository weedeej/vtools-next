import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Maintenance() {
  return (
    <div className={styles.container}>
      <Head>
        <title>vTools - Maintenance</title>
        <meta name="description" content="vTools(Valorant Tools)"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>

      <main className={styles.main}>
      <Image src='/images/vToolsLogo.png' alt='logo' width={64} height={64}/>
        <em className={styles.description, 'text-white mt-5'}>
            This website is currently on maintenance.
        </em>
      </main>

      <footer className={styles.footer}>
        <a href="https://discord.gg/ME5EdK8U9v"
          target="_blank"
          rel="noopener noreferrer"
          className='text-white' >
          Join Us!{' '}
          <span className={styles.logo}>
            <Image src="/assets/discord.svg" alt="Discord Logo" width={20} height={20}/>
          </span>
        </a>
        <a href="https://github.com/weedeej/vtools-next"
          target="_blank"
          rel="noopener noreferrer"
          className='text-white' >
          Source{' '}
          <span className={styles.logo}>
            <Image src="/assets/github.svg" alt="Github Logo" width={20} height={20}/>
          </span>
        </a>
      </footer>
    </div>
  )
}
