import backgroundPublic from '@/assets/lamyda-people-working.jpeg'

export default function BackgroundPublic() {
    return <div 
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: `url(${backgroundPublic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>
}