  const shouldShowCheckbox = (routine: CompanyRoutineDetail, period: PeriodColumn): boolean => {
    const routineFreq = getRoutineFreq(routine);
    return routineFreq === period.frequency || selectedPeriod === routineFreq;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCcw className="h-5 w-5 animate-spin text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Carregando rotinas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-800 dark:text-red-200 font-medium">Erro ao carregar rotinas</span>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
        <button
          onClick={refetch}
          className="mt-3 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Campo de busca */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar rotinas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Seletor de periodicidade */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as FrequencyType)}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        {/* Botões de ação e tabs */}
        <div className="flex items-center gap-4">
          <button
            onClick={refetch}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={routineCRUD.openCreateModal}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Rotina</span>
          </button>

          {/* Toggle de visualização */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'active' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Rotinas</span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'history' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'history' ? (
        <RoutinesExecutionHistory clientId={clientId} />
      ) : (
        <div>Conteúdo das rotinas ativas vai aqui</div>
      )}
    </div>
  );