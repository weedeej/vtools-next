import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const authClickHandler = () => {
    let id = prompt("Please input your Discord ID. Tutorial on getting this is found here: https://github.com/weedeej/vTools-Auth/blob/master/DiscordID.md");
    if (id != null) {
      window.location.replace('/auth?id=' + id);
      return;
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>vTools</title>
        <meta name="description" content="vTools(Valorant Tools)"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>

      <main className={styles.main}>
      <Image src='/images/vToolsLogo.png' alt='logo' width={64} height={64}/>
        <h1 className={styles.title}>
          Welcome to <Link href="/">vTools</Link>
        </h1>
        <em className='text-white'>(Index Template by Next.JS)</em>

        <p className={styles.description}>
        </p>

        <div className={styles.grid}>
          <a onClick={authClickHandler} href="#" className={styles.card}>
          <h2>vTools Auth &rarr;</h2>
            <p>Auth using Username & Password combination for Vii-chan BOT</p>
          </a>
          <a href="https://github.com/weedeej/ValorantCC" className={styles.card} target="_blank" rel="noreferrer">
            <h2>ValorantCC &rarr;</h2>
            <p>Valorant Custom crosshair Color. Use any color as crosshair and let others see it!</p>
          </a>
        </div>
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
