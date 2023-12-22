import Navbar from '@/components/navbar'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Navbar/>
      <div className="flex-grow bg-gray-200 p-4">
        Howdy World! 
      </div>
      <div className="w-full h-12 flex justify-center items-center bg-green-500 p-4">
        <input type="text" className="p-2" placeholder="Enter text here" />
      </div>
    </main>
  )
}