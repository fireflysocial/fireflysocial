# The Science of Friendship

Research on how friendships form, and what it means for Firefly Social's design. Every row cites a primary source; secondary write-ups are listed where they're easier to read.

## Findings

### 1. Time and repetition

| Finding | Source | Implication for Firefly Social |
|---------|--------|----------------------|
| It takes roughly **~50 hours** together to go from acquaintance to casual friend, **~90 hours** to friend, and **200+ hours** to close friend. Hours spent together *as friends* (hanging out, joking, catching up) count. Hours spent working side by side mostly don't. | Hall, J. A. (2019). How many hours does it take to make a friend? *Journal of Social and Personal Relationships, 36*(4), 1278–1296. [doi:10.1177/0265407518761225](https://doi.org/10.1177/0265407518761225) · [KU summary](https://www.aau.edu/node/17476) · [Greater Good](https://greatergood.berkeley.edu/article/item/how_long_does_it_take_to_make_a_friend) | One event (~2 hrs) is ~4% of the way to a casual friend. **Step 6 is the product, not a bonus.** Track "hours together" per connection as a north-star metric. Prefer recurring events and social (not task-focused) formats. |
| **Physical proximity predicts friendship.** In MIT student housing, residents were far more likely to befriend next-door neighbours than people a few doors away. | Festinger, L., Schachter, S., & Back, K. (1950). *Social Pressures in Informal Groups: A Study of Human Factors in Housing.* Harper. | Firefly Social should create **proximity by design**: put the same people in the same place repeatedly (same pod, same recurring event). |
| **Random seat neighbours** at a one-off introductory session were more likely to be friends **one year later**. Even sitting in the same row had an effect. | Back, M. D., Schmukle, S. C., & Egloff, B. (2008). Becoming friends by chance. *Psychological Science, 19*(5), 439–440. [doi:10.1111/j.1467-9280.2008.02106.x](https://doi.org/10.1111/j.1467-9280.2008.02106.x) · [ScienceDaily](https://www.sciencedaily.com/releases/2008/06/080602163842.htm) | Small, assigned first contacts (a pod, a table) can have lasting effects. **Assigning people to a pod is not artificial; it's how many real friendships start.** |
| **Mere exposure:** students who simply attended a class more often (without talking to anyone) were rated as more attractive and likeable at the end of term. | Moreland, R. L., & Beach, S. R. (1992). Exposure effects in the classroom. *Journal of Experimental Social Psychology, 28*(3), 255–276. [doi:10.1016/0022-1031(92)90055-O](https://doi.org/10.1016/0022-1031(92)90055-O) | Just showing up to the same recurring event raises liking. Recommend **the same series** to connections, not just any event. |
| **Familiarity increases attraction in live interaction.** More conversation between strangers raised liking, rebutting the claim that familiarity breeds contempt. | Reis, H. T., Maniaci, M. R., Caprariello, P. A., Eastwick, P. W., & Finkel, E. J. (2011). Familiarity does indeed promote attraction in live interaction. *JPSP, 101*(3), 557–570. [doi:10.1037/a0022885](https://doi.org/10.1037/a0022885) · [PDF](https://www.sas.rochester.edu/psy/people/faculty/reis_harry/assets/pdf/ReisManiaciCaprarielloEastwickFinkel_2011.pdf) | A second meeting is likely to go *better* than the first. Tell users this when they hesitate to RSVP again. |
| **Friendships decay without contact.** Emotional closeness to friends drops measurably when face-to-face contact falls. Family ties are more resistant to this. | Roberts, S. G. B., & Dunbar, R. I. M. (2011). Communication in social networks: Effects of kinship, network size, and emotional closeness. *Personal Relationships, 18*(3), 439–452. [doi:10.1111/j.1475-6811.2010.01310.x](https://doi.org/10.1111/j.1475-6811.2010.01310.x) | New connections need a **meeting cadence** (e.g. within 2–3 weeks), or they fade. Firefly Social should notice gaps and prompt a next meeting. |

### 2. Fear and miscalibration (why people don't approach)

| Finding | Source | Implication for Firefly Social |
|---------|--------|----------------------|
| **The liking gap:** after a conversation, people consistently underestimate how much their partner liked them. It persists for months among new dorm-mates. Shy people show a bigger gap. | Boothby, E. J., Cooney, G., Sandstrom, G. M., & Clark, M. S. (2018). The liking gap in conversations. *Psychological Science, 29*(11), 1742–1756. [doi:10.1177/0956797618783714](https://doi.org/10.1177/0956797618783714) · [Yale lab summary](https://clarkrelationshiplab.yale.edu/news/following-conversations-people-believe-they-others-more-others-them) | People won't pick connections they think didn't like them. **Show this finding during the "who did you click with?" step** ("People usually underestimate how much others enjoyed talking to them"). A **mutual, private** opt-in is essential because it removes the fear of rejection. |
| **People underestimate how pleasant talking to strangers is.** Commuters expected solitude to be nicer, but those told to talk to a stranger had a better ride, and the stranger enjoyed it too. | Epley, N., & Schroeder, J. (2014). Mistakenly seeking solitude. *Journal of Experimental Psychology: General, 143*(5), 1980–1999. [doi:10.1037/a0037323](https://doi.org/10.1037/a0037323) | The barrier is a forecast, not reality. Firefly Social's job is to **lower the perceived risk of saying hello**, which is what visible intent does. |
| **A week of practice reduces fear.** A scavenger-hunt game of talking to strangers made people's expectations more accurate, and the effects lasted. ~40% exchanged contact info and followed up with someone. | Sandstrom, G. M., Boothby, E. J., & Cooney, G. (2022). Talking to strangers: A week-long intervention reduces psychological barriers to social connection. *JESP, 102*, 104356. [doi:10.1016/j.jesp.2022.104356](https://doi.org/10.1016/j.jesp.2022.104356) · [SPSP blog](https://spsp.org/news/character-and-context-blog/sandstrom-boothby-cooney-talking-to-strangers) | **Lightweight "missions"** at events (e.g. "find someone who's also new to Vancouver") work and make approaching playful. |
| **Deep conversations go better than expected.** Strangers overestimated how awkward deep questions would be and underestimated how connected they'd feel. | Kardas, M., Kumar, A., & Epley, N. (2022). Overly shallow? Miscalibrated expectations create a barrier to deeper conversation. *JPSP, 122*(3), 367–398. [doi:10.1037/pspa0000281](https://doi.org/10.1037/pspa0000281) | Conversation openers should go **beyond "what do you do?"**, with one deeper prompt per pod. |
| **Reaching out is appreciated more than we think.** People sending a short check-in message underestimated how much the recipient valued it, and the surprise is what drives the appreciation. | Liu, P. J., Rim, S., Min, L., & Min, K. E. (2023). The surprise of reaching out: Appreciated more than we think. *JPSP, 124*(4), 754–771. [doi:10.1037/pspi0000402](https://doi.org/10.1037/pspi0000402) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/35816566/) | Post-match nudges ("send Priya a quick message") are worth it. Show users this finding to beat the "I don't want to bother them" hesitation. |

### 3. Closeness and similarity

| Finding | Source | Implication for Firefly Social |
|---------|--------|----------------------|
| **Escalating, reciprocal self-disclosure builds closeness quickly.** The "36 questions" procedure created strong closeness between strangers in 45 minutes. | Aron, A., Melinat, E., Aron, E. N., Vallone, R. D., & Bator, R. J. (1997). The experimental generation of interpersonal closeness. *PSPB, 23*(4), 363–377. [doi:10.1177/0146167297234003](https://doi.org/10.1177/0146167297234003) | Conversation prompts should **escalate across meetings** (light at meeting 1, deeper by meeting 3). Don't front-load intimacy. |
| **Taking turns disclosing** leads to more liking than one person disclosing while the other listens. | Sprecher, S., Treger, S., Wondra, J. D., Hilaire, N., & Wallpe, K. (2013). Taking turns: Reciprocal self-disclosure promotes liking in initial interactions. *JESP, 49*(5), 860–866. [doi:10.1016/j.jesp.2013.03.017](https://doi.org/10.1016/j.jesp.2013.03.017) | Prompts should be **"both answer"** questions, not interview-style. |
| **Perceived similarity matters more than actual similarity** once people interact. Actual similarity predicts attraction mainly before or without interaction. | Montoya, R. M., Horton, R. S., & Kirchner, J. (2008). Is actual similarity necessary for attraction? A meta-analysis. *JSPR, 25*(6), 889–922. [doi:10.1177/0265407508096700](https://doi.org/10.1177/0265407508096700) | Don't over-engineer matching. Interests are a **conversation starter**, not a compatibility score. Surfacing *discovered* common ground (shared answers) beats a "92% match" number. |

### 4. Groups

| Finding | Source | Implication for Firefly Social |
|---------|--------|----------------------|
| **Natural conversation groups cap at about 4 people.** Larger groups split into separate conversations. | Dunbar, R. I. M., Duncan, N. D. C., & Nettle, D. (1995). Size and structure of freely forming conversational groups. *Human Nature, 6*(1), 67–78. [doi:10.1007/BF02734136](https://doi.org/10.1007/BF02734136) | **Pods of 3–5** at events. A pod of 4 is one conversation; 6+ splits. |
| **Friendship networks are layered** (~5 intimate, ~15 close, ~50 good friends, ~150 meaningful contacts), and each layer needs more contact time to maintain. | Dunbar, R. I. M. (2018). The anatomy of friendship. *Trends in Cognitive Sciences, 22*(1), 32–51. [doi:10.1016/j.tics.2017.10.004](https://doi.org/10.1016/j.tics.2017.10.004) | Users have limited capacity. Don't push 20 new connections; aim for **2–5 people who keep meeting**. |
| **Weak ties matter.** On days people interacted with more casual acquaintances, they reported more happiness and belonging. | Sandstrom, G. M., & Dunn, E. W. (2014). Social interactions and well-being: The surprising power of weak ties. *PSPB, 40*(7), 910–922. [doi:10.1177/0146167214529799](https://doi.org/10.1177/0146167214529799) | Not every connection must become a close friend. **Being a familiar face at a recurring event** is valuable in itself. Count it as success. |

### 5. Why it matters (loneliness context)

| Finding | Source | Implication for Firefly Social |
|---------|--------|----------------------|
| Social isolation raises mortality risk about as much as other well-known risk factors (meta-analysis of 148 studies, 308k people). | Holt-Lunstad, J., Smith, T. B., & Layton, J. B. (2010). Social relationships and mortality risk: A meta-analytic review. *PLoS Medicine, 7*(7), e1000316. [doi:10.1371/journal.pmed.1000316](https://doi.org/10.1371/journal.pmed.1000316) | Grounds the mission. Useful for partners (health, city, university). |
| US Surgeon General declared loneliness a public health epidemic and called for building social infrastructure. | Office of the U.S. Surgeon General (2023). *Our Epidemic of Loneliness and Isolation.* [hhs.gov PDF](https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf) | Framing for grants and partners. |
| **Metro Vancouver:** 14% are often or always lonely, rising to **30% of 18–24 year-olds**. **About half find it difficult to make friends.** Community engagement fell from 2012 to 2017. | Vancouver Foundation (2017). *Connect & Engage* (n = 3,785). [Key findings PDF](https://www.vancouverfoundation.ca/sites/default/files/connect-engage/KeyFindings.pdf) · [Global News](https://globalnews.ca/news/3888949/new-report-finds-metro-vancouver-is-a-lonely-place-for-young-people) | Hard numbers for the "Vancouver Freeze" in [problem.md](problem.md). Target: young adults and newcomers. |
| **Canada:** 17% of 15–24 year-olds always or often feel lonely (Q1 2024). Youth report loneliness more often than older Canadians. | Statistics Canada (2024). *You've got a friend in me* (Canadian Social Survey). [statcan.gc.ca](https://statcan.gc.ca/o1/en/plus/6735-youve-got-friend-me) | National baseline. Use the same "how often do you feel lonely" question in Firefly Social's own surveys for comparability. |

## Design principles derived from the research

1. **Optimize for repeat meetings, not first meetings.** Hours together is the currency (Hall, 2019).
2. **Same people, same place, on a schedule.** Proximity and exposure do most of the work (Festinger 1950; Moreland & Beach 1992; Back 2008).
3. **Remove rejection risk.** Use private, mutual opt-in, and tell users about the liking gap (Boothby 2018; Epley & Schroeder 2014).
4. **Small groups of ~4.** (Dunbar 1995)
5. **Escalating, reciprocal prompts.** (Aron 1997; Sprecher 2013; Kardas 2022)
6. **Interests open conversations; they don't predict friendship.** (Montoya 2008)
7. **Prompt contact before it decays.** (Roberts & Dunbar 2011; Liu 2023)

## Target metrics suggested by the research

| Metric | Why |
|--------|-----|
| Median hours of shared events per mutual connection at 30 / 90 days | Hall: ~50 h to casual friend |
| % of mutual connections that meet again within 21 days | Decay without contact |
| % of users who attend the same recurring series 3+ times | Mere exposure / proximity |
| Self-reported loneliness (StatCan wording) at signup vs. 90 days | Outcome measure comparable to national data |

## Leads still to look into

- Hall (2019) follow-up work on *what activities* count most (play and joking vs. talk).
- Research on **newcomer and immigrant** friendship formation in Canadian cities.
- Evidence on **gender differences** in approaching strangers and safety concerns.
- **Third places** (Oldenburg, *The Great Good Place*, 1989) and how venue design affects mixing.
