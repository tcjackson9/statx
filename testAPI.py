import psycopg2
from bs4 import BeautifulSoup
import requests
import pandas as pd

# Supabase connection details
DB_HOST = "aws-0-us-west-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.xrstrludepuahpovxpzb"
DB_PASSWORD = "AZ1d3Tab7my1TubG"


WR_list = [
    "Davante Adams", "Jordan Addison", "Nelson Agholor", "Brandon Aiyuk", "Keenan Allen",
    "Tutu Atwell", "Calvin Austin III", "Kevin Austin Jr.", "Andre Baccellia", "Alex Bachman",
    "Javon Baker", "Michael Bandy", "Rashod Bateman", "Odell Beckham Jr.", "David Bell",
    "Ronnie Bell", "Braxton Berrios", "Tarik Black", "Chris Blair", "Jake Bobo",
    "Kendrick Bourne", "Kayshon Boutte", "Tyler Boyd", "Miles Boykin", "Jalen Brooks",
    "A.J Brown", "Dyami Brown", "Marquise Brown", "Noah Brown", "Jason Brownlee",
    "Cole Burgess", "Treylon Burks", "Jermaine Burton", "Deon Cain", "Marquez Callaway",
    "Parris Campbell", "DeAndre Carter", "Joshua Cephus", "Quintez Cephus", "DJ Chark",
    "Irvin Charles", "Ja'Marr Chase", "Dan Chisena", "Jalen Coker", "Keon Coleman",
    "Nico Collins", "Chris Conley", "Brandin Cooks", "Elijah Cooks", "Amari Cooper",
    "Malachi Corley", "Britain Covey", "Jacob Cowing", "River Cracraft", "Jalen Cropper",
    "Jamison Crowder", "Malik Cunningham", "Jaelon Darden", "Derius Davis", "Gabriel Davis",
    "Nathaniel Dell", "Stefon Diggs", "Phillip Dorsett", "Greg Dortch", "Jahan Dotson",
    "Romeo Doubs", "Demario Douglas", "Colton Dowell", "Josh Downs", "Dylan Drummond",
    "Grant DuBose", "Ashton Dulin", "Devin Duvernay", "D'Wayne Eskridge", "Mike Evans",
    "Erik Ezukanma", "Simi Fehoko", "Dez Fitzpatrick", "Ryan Flournoy", "Zay Flowers",
    "Bryce Ford-Wheaton", "Jeff Foreman", "Troy Franklin", "Russell Gage", "Xavier Gipson",
    "Chris Godwin", "Anthony Gould", "Danny Gray", "Antoine Green", "Jalen Guyton",
    "KJ Hamler", "Mecole Hardman", "Kelvin Harmon", "Marvin Harrison", "Deonte Harty",
    "Malik Heath", "Julian Hicks", "Tee Higgins", "Tyreek Hill", "Khadarel Hodge",
    "Isaiah Hodgins", "Mack Hollins", "DeAndre Hopkins", "Dennis Houston", "Lil'Jordan Humphrey",
    "Xavier Hutchinson", "Jalin Hyatt", "Andrei Iosivas", "Trenton Irwin", "JaQuae Jackson",
    "Jermaine Jackson", "Jha-Quan Jackson", "John Jackson", "Kearis Jackson", "Lucky Jackson",
    "Trishton Jackson", "Rakim Jarrett", "Justin Jefferson", "Van Jefferson", "Jauan Jennings",
    "Jerry Jeudy", "Jon Jiles Jr.", "Brandon Johnson", "Cam Johnson", "Collin Johnson",
    "Cornelius Johnson", "Diontae Johnson", "Jaylen Johnson", "Johnny Johnson", "Kameron Johnson",
    "Tyler Johnson", "Xavier Johnson", "Quentin Johnston", "Charlie Jones", "Jeshaun Jones",
    "Tim Jones", "Velus Jones", "Zay Jones", "Tom Kennedy", "Ramel Keyton",
    "Mason Kinsey", "Christian Kirk", "Keith Kirkwood", "Malik Knowles", "Tanner Knue",
    "Cooper Kupp", "CeeDee Lamb", "Allen Lazard", "Xavier Legette", "Tyler Lockett",
    "Drake London", "Terrace Marshall", "Tay Martin", "Jesse Matthews", "Luke McCaffrey",
    "Ray Ray McCloud", "Ladd McConkey", "Lance McCutcheon", "Terry McLaurin", "Jalen McMillan", "Jerrod Means", "Bo Melton", "DK Metcalf", "John Metchie", "Jakobi Meyers",
    "Anthony Miller", "Ryan Miller", "Scott Miller", "Dax Milne", "Marvin Mims",
    "Jonathan Mingo", "Adonai Mitchell", "DJ Montgomery", "Darnell Mooney", "DJ Moore",
    "David Moore", "Elijah Moore", "Rondale Moore", "Skyy Moore", "Malik Nabers",
    "Puka Nacua", "Jalen Nailor", "Rome Odunze", "Praise Olatoke", "Chris Olave",
    "Bryce Oliver", "Gunner Olszewski", "KJ Osborn", "Terique Owens", "Josh Palmer",
    "Tejhaun Palmer", "Trey Palmer", "Zach Pascal", "Tim Patrick", "Ricky Pearsall",
    "Donovan PeoplesJones", "AT Perry", "Dante Pettis", "Kyle Philips", "George Pickens",
    "Alec Pierce", "Michael Pittman Jr.", "Ja'Lynn Polk", "Brandon Powell", "Dezmon Patmon", "Jamir Chase", "Isaiah Weston", 
    "Seth Williams", "Jordan Veasy", "Dillon Stoner", "Isaiah Hodgins",
    "Deontay Burnett", "Austin Proehl", "Stephen Guidry", "Maurice Alexander",
    "Trevon Grimes", "Tamorrion Terry", "Whop Philyor", "Rico Bussey",
    "Josh Johnson", "Jonathan Adams", "Jaylon Moore", "Jalen Hurd",
    "Tyrie Cleveland", "Ventell Bryant", "Caleb Scott", "Anthony RatliffWilliams",
    "Taysir Mack", "Jhamon Ausbon", "Marquez Stevenson", "Dyami Brown",
    "D'Wayne Eskridge", "Amari Rodgers", "Tutu Atwell", "Cade Johnson",
    "Nico Collins", "Demetric Felton", "Kadarius Toney", "Ihmir SmithMarsette",
    "Anthony Schwartz", "Rashod Bateman", "Treylon Burks", "David Bell",
    "Elijah Moore", "Ronnie Bell", "Chris Olave", "Garrett Wilson",
    "Ja'Marr Chase", "Christian Watson", "Zay Flowers", "Josh Downs",
    "Marvin Mims Jr.", "Quentin Johnston", "Jordan Addison", "Puka Nacua",
    "Tyler Scott", "Jalen MorenoCropper", "Charlie Jones", "Cedric Tillman",
    "Rashee Rice", "Trey Palmer", "Kayshon Boutte", "Ronnie Hickman",
    "Andrei Iosivas", "Rakim Jarrett", "Xavier Hutchinson", "Michael Wilson",
    "Dontay Demus", "A.T. Perry", "Trevon Grimes", "Austin Watkins",
    "Malik Heath", "Jake Bobo", "Jadon Haselwood", "Bryce FordWheaton",
    "Jonathan Mingo", "Jayden Reed", "Matt Landers", "Joseph Ngata",
    "Justin Shorter", "Jaray Jenkins", "Derius Davis", "Antoine Green",
    "Demario Douglas", "Jason Brownlee", "Jacob Copeland", "Bryce Baringer"]

QB_list = [
    "Brandon Allen", "Josh Allen", "Kyle Allen", "Tyson Bagent", "Jason Bean", 
    "C.J. Beathard", "Stetson Bennett", "Carter Bradley", "Jacoby Brissett", 
    "Anthony Brown", "Jake Browning", "Shane Buechele", "Joe Burrow", 
    "Derek Carr", "Sean Clifford", "Kirk Cousins", "Andy Dalton", 
    "Jayden Daniels", "Sam Darnold", "Tommy DeVito", "Joshua Dobbs", 
    "Jeff Driskel", "Sam Ehlinger", "Justin Fields", "Joe Flacco", 
    "Jake Fromm", "Jimmy Garoppolo", "Jared Goff", "Jake Haener", 
    "Jaren Hall", "Sam Hartman", "Taylor Heinicke", "Justin Herbert", 
    "Hendon Hooker", "Sam Howell", "Tyler Huntley", "Jalen Hurts", 
    "Lamar Jackson", "Josh Johnson", "Daniel Jones", "Mac Jones", 
    "Case Keenum", "Trey Lance", "Trevor Lawrence", "Devin Leary", 
    "Will Levis", "Drew Lock", "Jordan Love", "Patrick Mahomes", 
    "Marcus Mariota", "Adrian Martinez", "Drake Maye", "Baker Mayfield", 
    "J.J. McCarthy", "Tanner McKee", "Davis Mills", "Joe Milton", 
    "Gardner Minshew", "Tanner Mordecai", "Nick Mullens", "Kyler Murray", 
    "Bo Nix", "Aidan O'Connell", "Chris Oladokun", "Michael Penix", 
    "Nathan Peterman", "Kenny Pickett", "John Rhys Plumlee", "Jack Plummer", 
    "Michael Pratt", "Dak Prescott", "Brock Purdy", "Spencer Rattler", 
    "Austin Reed", "Anthony Richardson", "Desmond Ridder", "Aaron Rodgers", 
    "Mason Rudolph", "Cooper Rush", "Brett Rypien", "Trevor Siemian", 
    "Kedon Slovis", "Geno Smith", "Matthew Stafford", "Easton Stick", 
    "Jarrett Stidham", "C.J. Stroud", "Tua Tagovailoa", "Tyrod Taylor", 
    "Skylar Thompson", "Dorian ThompsonRobinson", "Kyle Trask", "Jordan Travis", 
    "Mitchell Trubisky", "Clayton Tune", "Deshaun Watson", "Carson Wentz", 
    "Mike White", "Caleb Williams", "Malik Willis", "Russell Wilson", 
    "Zach Wilson", "Jameis Winston", "Logan Woodside", "Bryce Young", 
    "Bailey Zappe"
]

RB_list = [
    "Israel Abanikanda", "Ameer Abdullah", "De'Von Achane", "Salvon Ahmed",
    "Cam Akers", "Rasheen Ali", "Braelon Allen", "Tyler Allgeier",
    "Tyler Badie", "Saquon Barkley", "Trey Benson", "Cartavious Bigsby",
    "Raheem Blackshear", "Mike Boone", "British Brooks", "Christopher Brooks",
    "Jonathon Brooks", "Brittain Brown", "Chase Brown", "Robert Burns",
    "Michael Burton", "Michael Carter", "Ty Chandler", "Zach Charbonnet",
    "Julius Chestnut", "Nick Chubb", "James Conner", "Dalvin Cook",
    "James Cook", "Blake Corum", "DeeJay Dallas", "Isaiah Davis",
    "Malik Davis", "Re'Mahn Davis", "Tyrion DavisPrice", "Emari Demercado",
    "AJ Dillon", "J.K. Dobbins", "Rico Dowdle", "Chase Edmonds",
    "Gus Edwards", "Clyde EdwardsHelaire", "Austin Ekeler", "Ezekiel Elliott",
    "Audric Estime", "Travis Etienne", "Chris Evans", "Darrynton Evans",
    "Jerome Ford", "D'Onta Foreman", "Kenny Gainwell", "Myles Gaskin",
    "Jahmyr Gibbs", "Antonio Gibson", "Reggie Gilliam", "Tyler Goodson",
    "Frank Gore", "Eric Gray", "Elijah Green", "Melvin Gordon",
    "Ronnie Harmon", "Damien Harris", "Kevin Harris", "Najee Harris",
    "Brian Hill", "Derrick Henry", "Justice Hill", "Jeremy Hill",
    "Khalil Herbert", "Keaton Mitchell", "Joe Mixon", "David Montgomery",
    "Zack Moss", "Raheem Mostert", "Kene Nwangwu", "Dare Ogunbowale",
    "Isiah Pacheco", "Cordarrelle Patterson", "Jaret Patterson", "Samaje Perine",
    "Dameon Pierce", "Tony Pollard", "Adam Prentice", "Deneric Prince",
    "Louis ReesZammit", "Craig Reynolds", "Patrick Ricard", "Ronnie Rivers",
    "Bijan Robinson", "Brian Robinson", "Keilan Robinson", "Christopher Rodriguez",
    "Miles Sanders", "Cody Schrader", "Zavier Scott", "Trey Sermon",
    "Aaron Shampklin", "Will Shipley", "Devin Singletary", "Jabari Small",
    "Tyjae Spears", "Carson Steele", "Rhamondre Stevenson", "Pierre Strong",
    "D'Andre Swift", "J.J. Taylor", "Jonathan Taylor", "Patrick Taylor",
    "Tyrone Tracy Jr.", "Sean Tucker", "Sione Vaki", "Xazavian Valladay",
    "Deuce Vaughn", "Ke'Shawn Vaughn", "Kimani Vidal", "Kenneth Walker III",
    "Jonathan Ward", "Jaylen Warren", "Carlos Washington", "Blake Watson",
    "Ian Wheeler", "Rachaad White", "Zamir White", "Michael Wiley",
    "Avery Williams", "D.J. Williams", "Jamaal Williams", "Javonte Williams",
    "Kyren Williams", "Trayveon Williams", "Emanuel Wilson", "Jeffery Wilson",
    "Jaylen Wright", "Owen Wright"
]

TE_list = [
    "Nate Adkins", "Jordan Akins", "Mo Alie-Cox", "Erick All", "Davis Allen",
    "Mark Andrews", "AJ Barner", "Brenden Bates", "John Bates", "Jaheim Bell",
    "Daniel Bellinger", "Brock Bowers", "Shawn Bowman", "Pharaoh Brown",
    "Harrison Bryant", "Grant Calcaterra", "Stephen Carlson", "Tyler Conklin",
    "Tanner Conner", "Devin Culp", "Baylor Cupp", "Zach Davidson", "Tyler Davis",
    "Josiah Deguara", "Will Dissly", "Greg Dulcich", "Payne Durham", "Ross Dwelley",
    "Evan Engram", "Zach Ertz", "Gerald Everett", "Noah Fant", "Princeton Fant",
    "Luke Farrell", "Jake Ferguson", "Anthony Firkser", "Tucker Fisk",
    "John FitzPatrick", "Miller Forristall", "Joe Fortson", "Cole Fotheringham",
    "Feleipe Franks", "Pat Freiermuth", "Mike Gesicki", "Dallas Goedert",
    "Cam Grandy", "Kylen Granson", "Noah Gray", "Peyton Hendershot",
    "Hunter Henry", "Tyler Higbee", "Elijah Higgins", "Julian Hill",
    "Taysom Hill", "T.J. Hockenson", "Dallin Holker", "Austin Hooper",
    "Tanner Hudson", "Hayden Hurst", "Qadir Ismail", "Michael Jacobson",
    "E.J. Jenkins", "Juwan Johnson", "Theo Johnson", "Brevin Jordan",
    "Nikola Kalinic", "Dalton Keene", "Travis Kelce", "Ko Kieft", "Dalton Kincaid",
    "George Kittle", "Cole Kmet", "Dawson Knox", "Charlie Kolar", "Tucker Kraft",
    "Lucas Krull", "Zack Kuntz", "Sam LaPorta", "Cameron Latu", "Marcedes Lewis",
    "Isaiah Likely", "Hunter Long", "Tyler Mabry", "Will Mallory", "Chris Manhertz",
    "David Martin-Robinson", "Jordan Matthews", "Michael Mayer", "Trey McBride",
    "Sean McKeon", "Tanner McLachlan", "James Mitchell", "Zaire Mitchell-Paden",
    "Foster Moreau", "Quintin Morris", "John Mundt", "Patrick Murtagh", "Nick Muse",
    "Luke Musgrave", "David Njoku", "Thomas Odukoya", "Andrew Ogletree",
    "Chigoziem Okonkwo", "Josh Oliver", "Cade Otton", "Donald Parham",
    "Colby Parkinson", "Kyle Pitts", "Mason Pline", "MyCole Pruitt",
    "Teagan Quitoriano", "Tip Reiman", "Sammis Reyes", "Armani Rogers",
    "Jeremy Ruckert", "Brady Russell", "Drew Sample", "Ja'Tavion Sanders",
    "Eric Saubert", "Luke Schoonmaker", "Dalton Schultz", "Bernhard Seikovits",
    "John Samuel Shenker", "Justin Shorter", "Ben Sims", "Ben Sinnott",
    "Stone Smartt", "Irv Smith", "Jonnu Smith", "Durham Smythe", "Matt Sokol",
    "Brevyn Spann-Ford", "John Stephens", "Jack Stoll", "Cade Stover",
    "Brenton Strange", "Stephen Sullivan", "Geoff Swaim", "Tommy Sweeney",
    "Messiah Swinson", "Tanner Taula", "Ian Thomas", "Eric Tomlinson",
    "Jake Tonges", "Robert Tonyan", "Adam Trautman", "Tommy Tremble",
    "Cole Turner", "C.J. Uzomah", "Nick Vannett", "Travis Vokolek",
    "Darnell Washington", "Treyton Welch", "Trevon Wesco", "Jack Westover",
    "Blake Whiteheart", "Josh Whyle", "Mitchell Wilcox", "Jared Wiley",
    "Brayden Willis", "Joel Wilson", "Charlie Woerner", "Jelani Woods",
    "Brock Wright", "Colson Yankoff", "Thomas Yassmin", "Kenny Yeboah",
    "Shane Zylstra"
]

position_map = {"WR": "WR", "QB": "QB", "RB": "RB", "TE": "TE"}

def connect_db():
    """Establish a connection to the database."""
    try:
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise

def determine_position(player_name):
    """Determine the position of a player using the provided lists."""
    if player_name in WR_list:
        return "WR"
    elif player_name in QB_list:
        return "QB"
    elif player_name in RB_list:
        return "RB"
    elif player_name in TE_list:
        return "TE"
    else:
        return None

def upload_stats_to_db(data, week):
    """Upload player stats to the database."""
    conn = connect_db()
    cursor = conn.cursor()

    query = """
    INSERT INTO player_stats (
        player_name, position_id, team_id, week,
        passing_attempts, completions, passing_yards, passing_tds,
        rushing_attempts, rushing_yards, rushing_tds,
        receptions, receiving_yards, receiving_tds
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (player_name, team_id, week) DO UPDATE SET
        passing_attempts = EXCLUDED.passing_attempts,
        completions = EXCLUDED.completions,
        passing_yards = EXCLUDED.passing_yards,
        passing_tds = EXCLUDED.passing_tds,
        rushing_attempts = EXCLUDED.rushing_attempts,
        rushing_yards = EXCLUDED.rushing_yards,
        rushing_tds = EXCLUDED.rushing_tds,
        receptions = EXCLUDED.receptions,
        receiving_yards = EXCLUDED.receiving_yards,
        receiving_tds = EXCLUDED.receiving_tds;
    """

    for _, row in data.iterrows():
        position = determine_position(row['Player'])
        if position:
            position_id = position_map[position]
            try:
                cursor.execute(query, (
                    row['Player'], position_id, row['Team'], week,
                    row.get('PassingAttempts'), row.get('Completions'), row.get('PassingYards'), row.get('PassingTDs'),
                    row.get('RushingAttempts'), row.get('RushingYards'), row.get('RushingTDs'),
                    row.get('Receptions'), row.get('ReceivingYards'), row.get('ReceivingTDs')
                ))
            except Exception as e:
                print(f"Error inserting data for {row['Player']}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

def scrape_stats(url):
    """Scrape stats from the website."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    table = soup.find('table')
    
    if not table:
        print("Stats table not found on the page.")
        return None

    headers = [th.text.strip() for th in table.find('thead').find_all('th')]
    rows = table.find('tbody').find_all('tr')

    data = []
    for row in rows:
        cols = row.find_all(['th', 'td'])
        data.append([col.text.strip() for col in cols])

    df = pd.DataFrame(data, columns=headers)
    return df


def main():
    start_week = 1  # Set the starting week
    end_week = 18  # Set the ending week (regular season usually has 18 weeks)
    tables = [0, 1, 2]  # Table indices to scrape stats for different positions or stats

    for week in range(start_week, end_week + 1):
        for table_index in tables:
            # Construct the URL with week and table index
            url = f"https://sports.yahoo.com/nfl/stats/weekly/?selectedTable={table_index}&week={{%22week%22:{week},%22seasonPhase%22:%22REGULAR_SEASON%22}}"

            print(f"Scraping stats for week {week}, table {table_index}...")
            stats = scrape_stats(url)
            
            if stats is not None:
                print(f"Uploading stats for week {week}, table {table_index} to the database...")
                upload_stats_to_db(stats, week)
                print(f"Stats for week {week}, table {table_index} successfully uploaded.")
            else:
                print(f"No stats found for week {week}, table {table_index}. Moving to the next.")

    print("Completed scraping and uploading stats for all weeks and tables.")

if __name__ == "__main__":
    main()