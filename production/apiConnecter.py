import pymysql
import requests

player_list = ["Davante Adams", "Jordan Addison", "Nelson Agholor", "Brandon Aiyuk", "Kazmeir Allen", "Keenan Allen", "Chatarius Atwell", "Calvin Austin", "Kevin Austin", "Andre Baccellia", "Alex Bachman", "Javon Baker", "Michael Bandy", "Rashod Bateman", "Odell Beckham Jr.", "David Bell", "Ronnie Bell", "Braxton Berrios", "Tarik Black", "Chris Blair", "Jake Bobo", "Kendrick Bourne", "Kayshon Boutte", "Tyler Boyd", "Miles Boykin", "Jalen Brooks", "A.J. Brown", "Dyami Brown", "Marquise Brown", "Noah Brown", "Jason Brownlee", "Cole Burgess", "Treylon Burks", "Jermaine Burton", "Deon Cain", "Marquez Callaway", "Parris Campbell", "DeAndre Carter", "Joshua Cephus", "Quintez Cephus", "D.J. Chark", "Irvin Charles", "Ja'Marr Chase", "Dan Chisena", "Jalen Coker", "Keon Coleman", "Nico Collins", "Chris Conley", "Brandin Cooks", "Elijah Cooks", "Amari Cooper", "Malachi Corley", "Britain Covey", "Jacob Cowing", "River Cracraft", "Jalen Cropper", "Jamison Crowder", "Malik Cunningham", "Jaelon Darden", "Derius Davis", "Gabriel Davis", "Nathaniel Dell", "Stefon Diggs", "Phillip Dorsett", "Greg Dortch", "Jahan Dotson", "Romeo Doubs", "Demario Douglas", "Colton Dowell", "Josh Downs", "Dylan Drummond", "Grant DuBose", "Ashton Dulin", "Devin Duvernay", "D'Wayne Eskridge", "Mike Evans", "Erik Ezukanma", "Simi Fehoko", "Dez Fitzpatrick", "Ryan Flournoy", "Zay Flowers", "Bryce Ford-Wheaton", "Jeff Foreman", "Troy Franklin", "Russell Gage", "Xavier Gipson", "Chris Godwin", "Anthony Gould", "Danny Gray", "Antoine Green", "Jalen Guyton", "KJ Hamler", "Mecole Hardman", "Kelvin Harmon", "Marvin Harrison", "Deonte Harty", "Malik Heath", "Julian Hicks", "Tee Higgins", "Tyreek Hill", "Khadarel Hodge", "Isaiah Hodgins", "Mack Hollins", "DeAndre Hopkins", "Dennis Houston", "Lil'Jordan Humphrey", "Xavier Hutchinson", "Jalin Hyatt", "Andrei Iosivas", "Trenton Irwin", "JaQuae Jackson", "Jermaine Jackson", "Jha'Quan Jackson", "John Jackson", "Kearis Jackson", "Lucky Jackson", "Trishton Jackson", "Rakim Jarrett", "Justin Jefferson", "Van Jefferson", "Jauan Jennings", "Jerry Jeudy", "Jon Jiles Jr.", "Brandon Johnson", "Cam Johnson", "Collin Johnson", "Cornelius Johnson", "Diontae Johnson", "Jaylen Johnson", "Johnny Johnson", "Kameron Johnson", "Tyler Johnson", "Xavier Johnson", "Quentin Johnston", "Charlie Jones", "Jeshaun Jones", "Tim Jones", "Velus Jones", "Zay Jones", "Tom Kennedy", "Ramel Keyton", "Mason Kinsey", "Christian Kirk", "Keith Kirkwood", "Malik Knowles", "Tanner Knue", "Cooper Kupp", "CeeDee Lamb", "Allen Lazard", "Xavier Legette", "Tyler Lockett", "Drake London", "Terrace Marshall", "Tay Martin", "Jesse Matthews", "Luke McCaffrey", "Ray Ray McCloud", "Ladd McConkey", "Lance McCutcheon", "Terry McLaurin", "Jalen McMillan", "Jerrod Means", "Bo Melton", "D.K. Metcalf", "John Metchie", "Jakobi Meyers", "Anthony Miller", "Ryan Miller", "Scott Miller", "Dax Milne", "Marvin Mims", "Jonathan Mingo", "Adonai Mitchell", "D.J. Montgomery", "Darnell Mooney", "D.J. Moore", "David Moore", "Elijah Moore", "Rondale Moore", "Skyy Moore", "Malik Nabers", "Puka Nacua", "Jalen Nailor", "Rome Odunze", "Praise Olatoke", "Chris Olave", "Bryce Oliver", "Gunner Olszewski", "K.J. Osborn", "Terique Owens", "Josh Palmer", "Tejhaun Palmer", "Trey Palmer", "Zach Pascal", "Tim Patrick", "Ricky Pearsall", "Donovan Peoples-Jones", "A.T. Perry", "Dante Pettis", "Kyle Philips", "George Pickens", "Alec Pierce", "Michael Pittman", "Ja'Lynn Polk", "Brandon Powell", "Brandon Allen", "Josh Allen", "Kyle Allen", "Tyson Bagent", "Jason Bean", "C.J. Beathard", "Stetson Bennett", "Carter Bradley", "Jacoby Brissett", "Anthony Brown", "Jake Browning", "Shane Buechele", "Joe Burrow", "Derek Carr", "Sean Clifford", "Kirk Cousins", "Andy Dalton", "Jayden Daniels", "Sam Darnold", "Tommy DeVito", "Joshua Dobbs", "Jeff Driskel", "Sam Ehlinger", "Justin Fields", "Joe Flacco", "Jake Fromm", "Jimmy Garoppolo", "Jared Goff", "Jake Haener", "Jaren Hall", "Sam Hartman", "Taylor Heinicke", "Justin Herbert", "Hendon Hooker", "Sam Howell", "Tyler Huntley", "Jalen Hurts", "Lamar Jackson", "Josh Johnson", "Daniel Jones", "Mac Jones", "Case Keenum", "Trey Lance", "Trevor Lawrence", "Devin Leary", "Will Levis", "Drew Lock", "Jordan Love", "Patrick Mahomes", "Marcus Mariota", "Adrian Martinez", "Drake Maye", "Baker Mayfield", "J.J. McCarthy", "Tanner McKee", "Davis Mills", "Joe Milton", "Gardner Minshew", "Tanner Mordecai", "Nick Mullens", "Kyler Murray", "Bo Nix", "Aidan O'Connell", "Chris Oladokun", "Michael Penix", "Nathan Peterman", "Kenny Pickett", "John Rhys Plumlee", "Jack Plummer", "Michael Pratt", "Dak Prescott", "Brock Purdy", "Spencer Rattler", "Austin Reed", "Anthony Richardson", "Desmond Ridder", "Aaron Rodgers", "Mason Rudolph", "Cooper Rush", "Brett Rypien", "Trevor Siemian", "Kedon Slovis", "Geno Smith", "Matthew Stafford", "Easton Stick", "Jarrett Stidham", "C.J. Stroud", "Tua Tagovailoa", "Tyrod Taylor", "Skylar Thompson", "Dorian Thompson-Robinson", "Kyle Trask", "Jordan Travis", "Mitchell Trubisky", "Clayton Tune", "Deshaun Watson", "Carson Wentz", "Mike White", "Caleb Williams", "Malik Willis", "Russell Wilson", "Zach Wilson", "Jameis Winston", "Logan Woodside", "Bryce Young", "Bailey Zappe", "Israel Abanikanda", "Ameer Abdullah", "De'Von Achane", "Salvon Ahmed", "Cam Akers", "Rasheen Ali", "Braelon Allen", "Tyler Allgeier", "Tyler Badie", "Saquon Barkley", "Trey Benson", "Cartavious Bigsby", "Raheem Blackshear", "Mike Boone", "British Brooks", "Christopher Brooks", "Jonathon Brooks", "Brittain Brown", "Chase Brown", "Robert Burns", "Michael Burton", "Michael Carter", "Ty Chandler", "Zach Charbonnet", "Julius Chestnut", "Nick Chubb", "James Conner", "Dalvin Cook", "James Cook", "Blake Corum", "DeeJay Dallas", "Isaiah Davis", "Malik Davis", "Re'Mahn Davis", "Tyrion Davis-Price", "Emari Demercado", "AJ Dillon", "J.K. Dobbins", "Rico Dowdle", "Chase Edmonds", "Gus Edwards", "Clyde Edwards-Helaire", "Austin Ekeler", "Ezekiel Elliott", "Audric Estime", "Travis Etienne", "Chris Evans", "Darrynton Evans", "Jerome Ford", "D'Onta Foreman", "Kenny Gainwell", "Myles Gaskin", "Jahmyr Gibbs", "Antonio Gibson", "Reggie Gilliam", "Tyler Goodson", "Frank Gore", "Eric Gray", "Elijah Green", "Melvin Gordon", "Ronnie Harmon", "Damien Harris", "Kevin Harris", "Najee Harris", "Brian Hill", "Derrick Henry", "Justice Hill", "Jeremy Hill", "Khalil Herbert", "Keaton Mitchell", "Joe Mixon", "David Montgomery", "Zack Moss", "Raheem Mostert", "Kene Nwangwu", "Dare Ogunbowale", "Isiah Pacheco", "Cordarrelle Patterson", "Jaret Patterson", "Samaje Perine", "Dameon Pierce", "Tony Pollard", "Adam Prentice", "Deneric Prince", "Louis Rees-Zammit", "Craig Reynolds", "Patrick Ricard", "Ronnie Rivers", "Bijan Robinson", "Brian Robinson", "Keilan Robinson", "Christopher Rodriguez", "Miles Sanders", "Cody Schrader", "Zavier Scott", "Trey Sermon", "Aaron Shampklin", "Will Shipley", "Devin Singletary", "Jabari Small", "Tyjae Spears", "Carson Steele", "Rhamondre Stevenson", "Pierre Strong", "D'Andre Swift", "J.J. Taylor", "Jonathan Taylor", "Patrick Taylor", "Tyrone Tracy", "Sean Tucker", "Sione Vaki", "Xazavian Valladay", "Deuce Vaughn", "Ke'Shawn Vaughn", "Kimani Vidal", "Kenneth Walker", "Jonathan Ward", "Jaylen Warren", "Carlos Washington", "Blake Watson", "Ian Wheeler", "Rachaad White", "Zamir White", "Michael Wiley", "Avery Williams", "D.J. Williams", "Jamaal Williams", "Javonte Williams", "Kyren Williams", "Trayveon Williams", "Emanuel Wilson", "Jeffery Wilson", "Jaylen Wright", "Owen Wright", "Nate Adkins", "Jordan Akins", "Mo Alie-Cox", "Erick All", "Davis Allen", "Mark Andrews", "AJ Barner", "Brenden Bates", "John Bates", "Jaheim Bell", "Daniel Bellinger", "Brock Bowers", "Shawn Bowman", "Pharaoh Brown", "Harrison Bryant", "Grant Calcaterra", "Stephen Carlson", "Tyler Conklin", "Tanner Conner", "Devin Culp", "Baylor Cupp", "Zach Davidson", "Tyler Davis", "Josiah Deguara", "Will Dissly", "Greg Dulcich", "Payne Durham", "Ross Dwelley", "Evan Engram", "Zach Ertz", "Gerald Everett", "Noah Fant", "Princeton Fant", "Luke Farrell", "Jake Ferguson", "Anthony Firkser", "Tucker Fisk", "John FitzPatrick", "Miller Forristall", "Joe Fortson", "Cole Fotheringham", "Feleipe Franks", "Pat Freiermuth", "Mike Gesicki", "Dallas Goedert", "Cam Grandy", "Kylen Granson", "Noah Gray", "Peyton Hendershot", "Hunter Henry", "Tyler Higbee", "Elijah Higgins", "Julian Hill", "Taysom Hill", "T.J. Hockenson", "Dallin Holker", "Austin Hooper", "Tanner Hudson", "Hayden Hurst", "Qadir Ismail", "Michael Jacobson", "E.J. Jenkins", "Juwan Johnson", "Theo Johnson", "Brevin Jordan", "Nikola Kalinic", "Dalton Keene", "Travis Kelce", "Ko Kieft", "Dalton Kincaid", "George Kittle", "Cole Kmet", "Dawson Knox", "Charlie Kolar", "Tucker Kraft", "Lucas Krull", "Zack Kuntz", "Sam LaPorta", "Cameron Latu", "Marcedes Lewis", "Isaiah Likely", "Hunter Long", "Tyler Mabry", "Will Mallory", "Chris Manhertz", "David Martin-Robinson", "Jordan Matthews", "Michael Mayer", "Trey McBride", "Sean McKeon", "Tanner McLachlan", "James Mitchell", "Zaire Mitchell-Paden", "Foster Moreau", "Quintin Morris", "John Mundt", "Patrick Murtagh", "Nick Muse", "Luke Musgrave", "David Njoku", "Thomas Odukoya", "Andrew Ogletree", "Chigoziem Okonkwo", "Josh Oliver", "Cade Otton", "Donald Parham", "Colby Parkinson", "Kyle Pitts", "Mason Pline", "MyCole Pruitt", "Teagan Quitoriano", "Tip Reiman", "Sammis Reyes", "Armani Rogers", "Jeremy Ruckert", "Brady Russell", "Drew Sample", "Ja'Tavion Sanders", "Eric Saubert", "Luke Schoonmaker", "Dalton Schultz", "Bernhard Seikovits", "John Samuel Shenker", "Justin Shorter", "Ben Sims", "Ben Sinnott", "Stone Smartt", "Irv Smith", "Jonnu Smith", "Durham Smythe", "Matt Sokol", "Brevyn Spann-Ford", "John Stephens", "Jack Stoll", "Cade Stover", "Brenton Strange", "Stephen Sullivan", "Geoff Swaim", "Tommy Sweeney", "Messiah Swinson", "Tanner Taula", "Ian Thomas", "Eric Tomlinson", "Jake Tonges", "Robert Tonyan", "Adam Trautman", "Tommy Tremble", "Cole Turner", "C.J. Uzomah", "Nick Vannett", "Travis Vokolek", "Darnell Washington", "Treyton Welch", "Trevon Wesco", "Jack Westover", "Blake Whiteheart", "Josh Whyle", "Mitchell Wilcox", "Jared Wiley", "Brayden Willis", "Joel Wilson", "Charlie Woerner", "Jelani Woods", "Brock Wright", "Colson Yankoff", "Thomas Yassmin", "Kenny Yeboah", "Shane Zylstra"]

connection = pymysql.connect(
    host="playerstatsdbsql.mysql.database.azure.com",  # Use the Azure hostname
    user="alex",                      # Include the server name with the username
    password="Rendypoo1",                              # Your password
    database="playerStats",                      # Your database name
)
cursor = connection.cursor()

def handle_empty(value):
    # Return None if value is empty string, to insert NULL in the DB, otherwise return the value
    if value == '':
        return 0
    return value

for player_name in player_list:
    api_url = f"http://127.0.0.1:5000/api/player/{player_name}"
    # Fetch the player data from the API
    response = requests.get(api_url)
    try: 
        response.raise_for_status()

        player_data = response.json()
        data = player_data.get("stats", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {player_name}: {e}")
        # Continue with the next player
        continue
    position = player_data.get("position")

    if not data or not position:
        print(f"No stats or position data found for the player {player_name}.")
        continue

    # Create a unique table for the player based on their name (e.g., "Chris_Godwin")
    table_name = player_name.replace(" ", "_")  # Replace spaces with underscores

    # Create table based on position
    if position == "QB":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                attempts INT,
                completions INT,
                interceptions INT,
                passing_touchdowns INT,
                quarterback_rating FLOAT,
                rush_yards INT,
                rushing_attempts INT,
                rushing_tds INT,
                yards INT
            );
        """
    elif position == "RB":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                rush_yards INT,
                rushing_attempts INT,
                rushing_tds INT,
                receiving_yards INT,
                receptions INT,
                receiving_tds INT
            );
        """
    elif position == "WR":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                receiving_yards INT,
                receptions INT,
                targets INT,
                touchdowns INT
            );
        """
    else:
        print(f"Unsupported position {position} for {player_name}.")
        continue

    cursor.execute(create_table_sql)  # Create the table based on the position

    # Insert the player data into the newly created table
    if position == "QB":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, attempts, completions,
                                        interceptions, passing_touchdowns, quarterback_rating, 
                                        rush_yards, rushing_attempts, rushing_tds, yards)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            values = (
                player_name, 
                handle_empty(int(stat["week"])), 
                handle_empty((stat["attempts"])), 
                handle_empty((stat["completions"])), 
                handle_empty((stat["interceptions"])), 
                handle_empty((stat["passing_touchdowns"])), 
                handle_empty((stat["quarterback_rating"])),
                handle_empty((stat["rush_yards"])),
                handle_empty((stat["rushing attempts"])),
                handle_empty((stat["rushing_tds"])),
                handle_empty((stat["yards"]))
            )
            cursor.execute(insert_query, values)

    elif position == "RB":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, rush_yards, rushing_attempts, rushing_tds, 
                                        receiving_yards, receptions, receiving_tds)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            values = (
                player_name, 
                int(stat["week"]), 
                handle_empty(stat["rush_yards"]), 
                handle_empty(stat["rushing_attempts"]), 
                handle_empty(stat["rushing_tds"]),
                handle_empty(stat["receiving_yards"]),
                handle_empty(stat["receptions"]),
                handle_empty(stat["receiving_tds"])
            )
            cursor.execute(insert_query, values)

    elif position == "WR":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, receiving_yards, receptions, targets, touchdowns)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            # Safely convert missing targets to 0, empty string is treated as NULL
            values = (
                player_name, 
                int(stat["week"]), 
                handle_empty(stat["receiving_yards"]), 
                handle_empty(stat["receptions"]), 
                handle_empty(stat.get("targets", "")), 
                handle_empty(stat["touchdowns"])
            )
            cursor.execute(insert_query, values)

    # Commit the transaction
    connection.commit()
    print(f"Data for {player_name} inserted successfully into table '{table_name}'.")

# Close the connection
cursor.close()
connection.close()