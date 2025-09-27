// 遺伝的アルゴリズム（GA）エージェント
export interface GAParams {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  maxGenerations: number;
}

export interface Individual {
  genes: number[];
  fitness: number;
}

export class GARunner {
  private population: Individual[] = [];
  private generation: number = 0;
  private bestIndividual: Individual | null = null;
  private params: GAParams;

  constructor(params: Partial<GAParams> = {}) {
    this.params = {
      populationSize: params.populationSize || 50,
      mutationRate: params.mutationRate || 0.1,
      crossoverRate: params.crossoverRate || 0.8,
      maxGenerations: params.maxGenerations || 100
    };
  }

  public initializePopulation(): void {
    this.population = [];
    for (let i = 0; i < this.params.populationSize; i++) {
      this.population.push({
        genes: this.generateRandomGenes(),
        fitness: 0
      });
    }
  }

  private generateRandomGenes(): number[] {
    // 各遺伝子は行動の重みを表す（right, left, jump, run）
    return Array.from({ length: 4 }, () => Math.random() * 2 - 1);
  }

  public getAction(gameState: any): { right: boolean; left: boolean; jump: boolean; run: boolean } {
    if (this.population.length === 0) {
      this.initializePopulation();
    }

    const currentIndividual = this.population[this.generation % this.params.populationSize];
    const genes = currentIndividual.genes;

    // ゲーム状態に基づいて行動を決定
    const obs = this.extractObservation(gameState);
    
    // 遺伝子の重みに基づいて行動を計算
    const rightScore = genes[0] + (obs.gap > 0 ? 0.5 : 0);
    const leftScore = genes[1];
    const jumpScore = genes[2] + (obs.gap > 0 && obs.gap < 2 ? 1.0 : 0);
    const runScore = genes[3] + (obs.gap > 0 ? 0.3 : 0);

    return {
      right: rightScore > 0,
      left: leftScore > 0,
      jump: jumpScore > 0.5,
      run: runScore > 0
    };
  }

  private extractObservation(gameState: any): { gap: number; enemy: boolean; ground: boolean } {
    // 簡易的な観測データ抽出
    const player = gameState.player;
    const platforms = gameState.level.platforms;
    
    // 前方のギャップを検出
    let gap = 0;
    for (const platform of platforms) {
      if (platform.x > player.x && platform.x < player.x + 100) {
        gap = platform.x - player.x;
        break;
      }
    }

    // 敵の検出
    let enemy = false;
    for (const enemyObj of gameState.level.enemies) {
      if (Math.abs(enemyObj.x - player.x) < 50) {
        enemy = true;
        break;
      }
    }

    return {
      gap,
      enemy,
      ground: player.onGround
    };
  }

  public updateFitness(score: number): void {
    if (this.population.length > 0) {
      const currentIndex = this.generation % this.params.populationSize;
      this.population[currentIndex].fitness = score;
      
      if (!this.bestIndividual || score > this.bestIndividual.fitness) {
        this.bestIndividual = { ...this.population[currentIndex] };
      }
    }
  }

  public nextGeneration(): void {
    if (this.generation >= this.params.maxGenerations) {
      return;
    }

    // 選択、交叉、突然変異
    const newPopulation: Individual[] = [];
    
    // エリート選択（上位20%を保持）
    const eliteCount = Math.floor(this.params.populationSize * 0.2);
    const sortedPopulation = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push({ ...sortedPopulation[i] });
    }

    // 残りを交叉と突然変異で生成
    while (newPopulation.length < this.params.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      const child = this.crossover(parent1, parent2);
      const mutatedChild = this.mutate(child);
      
      newPopulation.push(mutatedChild);
    }

    this.population = newPopulation;
    this.generation++;
  }

  private tournamentSelection(): Individual {
    const tournamentSize = 3;
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  private crossover(parent1: Individual, parent2: Individual): Individual {
    const child: Individual = {
      genes: [],
      fitness: 0
    };

    for (let i = 0; i < parent1.genes.length; i++) {
      if (Math.random() < this.params.crossoverRate) {
        child.genes[i] = (parent1.genes[i] + parent2.genes[i]) / 2;
      } else {
        child.genes[i] = Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i];
      }
    }

    return child;
  }

  private mutate(individual: Individual): Individual {
    const mutated = { ...individual, genes: [...individual.genes] };
    
    for (let i = 0; i < mutated.genes.length; i++) {
      if (Math.random() < this.params.mutationRate) {
        mutated.genes[i] += (Math.random() - 0.5) * 0.2;
        mutated.genes[i] = Math.max(-1, Math.min(1, mutated.genes[i]));
      }
    }

    return mutated;
  }

  public getStats(): { generation: number; bestFitness: number; avgFitness: number } {
    const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
    return {
      generation: this.generation,
      bestFitness: this.bestIndividual?.fitness || 0,
      avgFitness
    };
  }
}
