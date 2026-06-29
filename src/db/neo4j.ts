import neo4j, { Driver, Session } from 'neo4j-driver';
import { Quest } from '../types';

let driver: Driver | null = null;

export const initNeo4j = () => {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (uri && user && password) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      console.log('Neo4j Driver initialized');
      // Initialize vector index
      const session = driver.session();
      session.run(`
        CREATE VECTOR INDEX quest_embeddings IF NOT EXISTS
        FOR (q:Quest)
        ON (q.embedding)
        OPTIONS {indexConfig: {
          \`vector.dimensions\`: 768,
          \`vector.similarity_function\`: 'cosine'
        }}
      `).catch(e => console.error("Error creating vector index:", e))
        .finally(() => session.close());
    } catch (error) {
      console.error('Failed to initialize Neo4j driver:', error);
    }
  } else {
    console.warn('Neo4j credentials missing in environment variables. Falling back to in-memory store.');
  }
};

export const getSession = (): Session | null => {
  if (!driver) return null;
  return driver.session();
};

export const closeNeo4j = async () => {
  if (driver) {
    await driver.close();
  }
};

// Example operations for Task/Quest graph
export const saveQuestToGraph = async (quest: Quest, embedding?: number[]) => {
  const session = getSession();
  if (!session) return;
  
  try {
    // 1. Create or update the Quest node
    if (embedding && embedding.length > 0) {
      await session.run(
        `
        MERGE (q:Quest {id: $id})
        SET q.title = $title, 
            q.type = $type, 
            q.estimatedHours = $estimatedHours,
            q.health = $health,
            q.embedding = $embedding
        `,
        {
          id: quest.id,
          title: quest.title,
          type: quest.type || 'quest',
          estimatedHours: quest.estimatedHours || 0,
          health: typeof quest.health === 'number' ? quest.health : 100,
          embedding: embedding
        }
      );
    } else {
      await session.run(
        `
        MERGE (q:Quest {id: $id})
        SET q.title = $title, 
            q.type = $type, 
            q.estimatedHours = $estimatedHours,
            q.health = $health
        `,
        {
          id: quest.id,
          title: quest.title,
          type: quest.type || 'quest',
          estimatedHours: quest.estimatedHours || 0,
          health: typeof quest.health === 'number' ? quest.health : 100
        }
      );
    }

    // 2. Create relationships for dependencies
    if (quest.dependencies && quest.dependencies.length > 0) {
      // Create DEPENDS_ON relationship from this quest to its dependencies
      for (const depId of quest.dependencies) {
        await session.run(
          `
          MERGE (q:Quest {id: $id})
          MERGE (dep:Quest {id: $depId})
          MERGE (q)-[:DEPENDS_ON]->(dep)
          `,
          {
            id: quest.id,
            depId: depId
          }
        );
      }
    }
  } catch (error) {
    console.error('Error saving quest to Neo4j:', error);
  } finally {
    await session.close();
  }
};

export const findSimilarQuests = async (embedding: number[], limit: number = 3): Promise<Quest[]> => {
  const session = getSession();
  if (!session) return [];

  try {
    // Using vector index query
    const result = await session.run(
      `
      CALL db.index.vector.queryNodes('quest_embeddings', $limit, $embedding)
      YIELD node AS q, score
      RETURN q, score
      `,
      {
        embedding,
        limit
      }
    );

    return result.records.map(record => {
      const node = record.get('q').properties;
      return {
        id: node.id,
        title: node.title,
        type: node.type,
        estimatedHours: typeof node.estimatedHours === 'number' ? node.estimatedHours : node.estimatedHours?.toNumber?.() || 0,
        health: typeof node.health === 'number' ? node.health : node.health?.toNumber?.() || 100,
        maxHealth: 100,
        deadline: new Date().toISOString(),
        tasks: [],
        rewards: { xp: 0, coins: 0 },
        riskScore: 'medium',
        dependencies: []
      } as Quest;
    });
  } catch (error) {
    console.error('Error finding similar quests in Neo4j:', error);
    return [];
  } finally {
    await session.close();
  }
};

export const fetchAllQuestsGraph = async (): Promise<Quest[]> => {
  const session = getSession();
  if (!session) return [];

  try {
    const result = await session.run(
      `
      MATCH (q:Quest)
      OPTIONAL MATCH (q)-[:DEPENDS_ON]->(dep:Quest)
      RETURN q, collect(dep.id) as dependencies
      `
    );

    return result.records.map(record => {
      const node = record.get('q').properties;
      const dependencies = record.get('dependencies');
      
      return {
        id: node.id,
        title: node.title,
        type: node.type,
        estimatedHours: typeof node.estimatedHours === 'number' ? node.estimatedHours : node.estimatedHours?.toNumber?.() || 0,
        health: typeof node.health === 'number' ? node.health : node.health?.toNumber?.() || 100,
        maxHealth: 100, // Default or fetch from db
        deadline: new Date().toISOString(), // Default or fetch from db
        tasks: [], // Tasks could also be modeled as nodes in Neo4j
        rewards: { xp: 0, coins: 0 },
        riskScore: 'medium',
        dependencies: dependencies || []
      } as Quest;
    });
  } catch (error) {
    console.error('Error fetching quests from Neo4j:', error);
    return [];
  } finally {
    await session.close();
  }
};
